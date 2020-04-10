<template>
    <div>
        <v-data-table
            :headers="tableHeaders"
            :loading="loading"
            :items="items"
            :items-per-page="5"
            item-key="code"
            :show-expand="itemToPeptidesMapping"
            :expanded.sync="expandedItemsList">
            <template v-slot:top>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon @click="saveTableAsCsv()" class="table-to-csv-button" v-on="on">mdi-download</v-icon>
                    </template>
                    <span>Download table as CSV</span>
                </v-tooltip>
            </template>
            <!-- We can only process the tree when a mapping between items and peptides is given -->
            <template v-slot:expanded-item="{ headers, item }" v-if="this.itemToPeptidesMapping">
                <td class="item-treeview" :colspan="headers.length">
                    <div v-if="tree && (treeAvailable.get(item) || computeTree(item))">
                        <v-btn small depressed class="item-treeview-dl-btn" @click="saveImage(item)">
                            <v-icon>mdi-download</v-icon>
                            Save as image
                        </v-btn>
                        <treeview
                            :id="treeViewId(item)"
                            :data="treeAvailable.get(item)"
                            :autoResize="true"
                            :width="650"
                            :height="230"
                            :tooltip="tooltip"
                            :colors="highlightColorFunc"
                            :enableAutoExpand="true"
                            :linkStrokeColor="linkStrokeColor"
                            :nodeStrokeColor="highlightColorFunc"
                            :nodeFillColor="highlightColorFunc">
                        </treeview>
                    </div>
                </td>
            </template>
            <template v-slot:[`item.count`]="{ item }">
                <div :style="{
                        padding: '12px',
                        background: 'linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ' + item.relativeCount * 100 + '%, rgba(255,255,255,0) ' + item.relativeCount * 100 + '%)',
                    }">
                    {{ showPercentage ? (item.relativeCount * 100).toFixed(2) + " %" : item.count }}
                </div>
            </template>
            <template v-slot:item.name="{ item }">
                <span style="text-overflow: ellipsis;">
                     {{ item.name }}
                </span>
            </template>
            <template v-slot:item.action="{ item }">
                <v-tooltip :open-delay=1000 bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon @click="saveSummaryAsCsv(item)" class="row-to-csv-button" v-on="on">
                            mdi-download
                        </v-icon>
                    </template>
                    <span>Download CSV summary of the filtered functional annotation</span>
                </v-tooltip>
            </template>
        </v-data-table>
        <image-download-modal ref="imageDownloadModal"/>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { tooltipContent } from "../visualizations/VisualizationHelper";
import Treeview from "../visualizations/Treeview.vue";
import ImageDownloadModal from "../utils/ImageDownloadModal.vue";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import TableItem from "./../tables/TableItem";
import NetworkUtils from "./../../business/communication/NetworkUtils";
import CsvUtils from "./../../business/storage/CsvUtils";
import FunctionalSummaryProcessor from "./../../business/processors/functional/FunctionalSummaryProcessor";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import PeptideCountTableProcessor from "./../../business/processors/raw/PeptideCountTableProcessor";
import LcaCountTableProcessor from "./../../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import Tree from "./../../business/ontology/taxonomic/Tree";
import NcbiOntologyProcessor from "./../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import TreeNode from "./../../business/ontology/taxonomic/TreeNode";
import AnalyticsUtil from "./../../business/analytics/AnalyticsUtil";
import { CountTable } from "./../../business/counts/CountTable";
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";

@Component({
    components: {
        Treeview,
        ImageDownloadModal
    },
    computed:
    {
        tableHeaders: function() {
            const headers = [
                {
                    text: "",
                    align: "left",
                    value: "",
                    width: "5%",
                    sortable: false
                },
                {
                    text: this.countName + (this.showPercentage ? " %" : ""),
                    align: "left",
                    value: "count",
                    width: "20%"
                }, {
                    text: this.annotationName,
                    align: "left",
                    value: "code",
                    width: this.itemsToPeptideMapping ? "25%" : "30%"
                }, {
                    text: "Name",
                    align: "left",
                    value: "name",
                    width: this.itemsToPeptideMapping ? "30%" : "45%"
                }
            ];

            if (this.itemsToPeptideMapping) {
                headers.push({
                    text: "Actions",
                    align: "center",
                    width: "15%",
                    value: "action"
                });
            }

            return headers;
        }
    }
})
export default class AmountTable extends Vue {
    $refs!: {
        imageDownloadModal: ImageDownloadModal
    }

    @Prop({ required: true })
    protected items: TableItem[];
    @Prop({ required: true })
    protected annotationName: string;

    /**
     * What items are displayed as counts? (e.g. peptides, proteins, ...)
     */
    @Prop({ required: false, default: "Peptides" })
    protected countName: string;
    @Prop({ required: false })
    protected namespace: string;
    @Prop({ required: false })
    protected searchConfiguration: SearchConfiguration;
    @Prop({ required: false })
    protected tree: Tree;
    /**
     * A map that returns for a given annotation all peptides associated with this annotation. If this map is not
     * given, then no TreeView will be rendered and no expandable rows will be present.
     */
    @Prop({ required: false })
    protected itemToPeptidesMapping: Map<string, Peptide[]>;
    @Prop({ required: false })
    protected taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;
    @Prop({ required: false, default: false })
    protected loading: boolean;
    @Prop({ required: false, default: false })
    protected showPercentage: boolean;

    protected treeAvailable = new Map<TableItem, TreeNode>();

    // All settings for each Treeview that remain the same
    protected tooltip: (d: any) => string = tooltipContent;
    protected highlightColor: string = "#ffc107";
    protected highlightColorFunc: (d: any) => string = d => d.included ? this.highlightColor : "lightgrey";
    protected linkStrokeColor: (d: any) => string = ({ target: d }) => this.highlightColorFunc(d);
    protected expandedItemsList = [];

    private async saveTableAsCsv(): Promise<void> {
        const columnNames = ["Peptides", this.annotationName, "Name"];
        let grid: string[][] = this.items.map(item => [item.count.toString(), item.code, item.name]);
        grid = [columnNames].concat(grid);
        await NetworkUtils.downloadDataByForm(
            CsvUtils.toCsvString(grid),
            this.annotationName.replace(/ /g, "_") + (this.namespace? "-" + this.namespace: "") + "-export.csv",
            "text/csv"
        )
    }

    private async saveSummaryAsCsv(term: TableItem): Promise<void> {
        const peptideTableProcessor = new PeptideCountTableProcessor();
        const peptideCounts = await peptideTableProcessor.getPeptideCountTable(
            this.itemToPeptidesMapping.get(term.code),
            this.searchConfiguration
        );

        const functionalSummaryProcessor = new FunctionalSummaryProcessor();
        const data = await functionalSummaryProcessor.summarizeFunctionalAnnotation(
            term.definition,
            peptideCounts,
            this.searchConfiguration
        );

        await NetworkUtils.downloadDataByForm(
            CsvUtils.toCsvString(data),
            term.code.replace(/:/g, "_") + ".csv",
            "text/csv"
        );
    }

    @Watch("tree")
    private onTreeChanged() {
        this.treeAvailable.clear();
    }

    /**
     * This function is called by the DataTable whenever it requests a tree. This function then asynchronously
     * computes this tree and fills in the associated entry in the treeAvailable map. The DataTable watches
     * changes in this map and reacts appropriately.
     */
    private computeTree(term: TableItem): boolean {
        const peptidesForTerm = this.itemToPeptidesMapping.get(term.code);
        const rootNode = this.tree.getRoot().callRecursivelyPostOder((t: TreeNode, c: any) => {
            const included = c.some(x => x.included) ||
                (
                    this.taxaToPeptidesMapping.has(t.id) &&
                    this.taxaToPeptidesMapping.get(t.id).some(pept => peptidesForTerm.includes(pept))
                );

            return Object.assign(Object.assign({}, t), { included: included, children: c });
        });
        this.treeAvailable.set(term, rootNode);
        return true;
    }

    private treeViewId(term: TableItem): string {
        return "TreeView-" + term.code.replace(/[.:]/g, "-");
    }

    private saveImage(term: TableItem): void {
        AnalyticsUtil.logToGoogle("Multi peptide", "Save Image for FA");
        const downloadModal = this.$refs.imageDownloadModal as ImageDownloadModal;
        downloadModal.downloadSVG(
            "unipept_treeview_" + term.code.replace(":", "_"),
            "#" + this.treeViewId(term) + " svg"
        );
    }
}
</script>

<style lang="less" scoped>
    @import './../../assets/style/amount-table.css.less';
</style>
