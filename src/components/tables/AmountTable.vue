<template>
    <div>
        <v-data-table
            :headers="tableHeaders"
            :loading="loading"
            :items="items"
            :items-per-page="rowsPerPage"
            item-key="code"
            :show-expand="itemToPeptidesMapping !== null"
            :expanded.sync="expandedItemsList">
            <template v-slot:header.action>
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-icon @click="saveTableAsCsv()" v-on="on">mdi-download</v-icon>
                    </template>
                    <span>Download table as CSV</span>
                </v-tooltip>
            </template>
            <!-- We can only process the tree when a mapping between items and peptides is given -->
            <template v-slot:expanded-item="{ headers, item }" v-if="itemToPeptidesMapping">
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
                        <div v-if="treeAvailable.get(item) === undefined" class="d-flex justify-center align-center">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </div>
                    </div>
                </td>
            </template>
            <template v-slot:item.count="{ item }">
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
            <template v-slot:item.code="{ item }">
                <a :href="externalUrlConstructor(item.code)" target="_blank" class="font-regular">
                    {{ item.code }}
                    <v-icon x-small>mdi-open-in-new</v-icon>
                </a>
            </template>
            <template v-slot:item.action="{ item }">
                <v-tooltip top v-if="itemToPeptidesMapping">
                    <template v-slot:activator="{ on }">
                        <v-btn icon @click="saveSummaryAsCsv(item)" v-on="on">
                            <v-icon>
                                mdi-download
                            </v-icon>
                        </v-btn>
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
import PeptideCountTableProcessor from "./../../business/processors/raw/PeptideCountTableProcessor";
import Tree from "./../../business/ontology/taxonomic/Tree";
import TreeNode from "./../../business/ontology/taxonomic/TreeNode";
import AnalyticsUtil from "./../../business/analytics/AnalyticsUtil";
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import HighlightedTreeProcessor from "./../../business/processors/taxonomic/ncbi/HighlightedTreeProcessor";
import NcbiOntologyProcessor from "./../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";
import Pept2DataCommunicator from "./../../business/communication/peptides/Pept2DataCommunicator";

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
                    text: this.countName + (this.showPercentage ? " %" : ""),
                    align: "start",
                    value: "count",
                    width: "20%"
                }, {
                    text: this.annotationName,
                    align: "start",
                    value: "code",
                    width: "30%"
                }, {
                    text: "Name",
                    align: "start",
                    value: "name",
                    width: "45%"
                }, {
                    text: "",
                    align: "center",
                    value: "action",
                    width: "5%",
                    sortable: false
                }
            ];

            if (this.showNamespace) {
                headers.splice(3, 0, {
                    text: "Namespace",
                    align: "start",
                    value: "definition.namespace",
                    width: "20%"
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
    @Prop({ required: true })
    private externalUrlConstructor: (code: string) => string;
    @Prop({ required: true })
    private assay: ProteomicsAssay;

    /**
     * What items are displayed as counts? (e.g. peptides, proteins, ...)
     */
    @Prop({ required: false, default: "Peptides" })
    protected countName: string;
    @Prop({ required: false })
    protected namespace: string;
    @Prop({ required: false, default: false })
    private showNamespace: boolean;
    @Prop({ required: false })
    protected tree: Tree;
    /**
     * A map that returns for a given annotation all peptides associated with this annotation. If this map is not
     * given, then no TreeView will be rendered and no expandable rows will be present.
     */
    @Prop({ required: false })
    protected itemToPeptidesMapping: Map<string, Peptide[]>;
    /**
     * A map that returns for a taxon all peptides associated with this taxon.
     */
    @Prop({ required: false })
    protected taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;
    @Prop({ required: false, default: false })
    protected loading: boolean;
    @Prop({ required: false, default: false })
    protected showPercentage: boolean;
    @Prop({ required: false, default: 5 })
    private rowsPerPage: number;

    private treeAvailable = new Map<TableItem, TreeNode>();

    // All settings for each Treeview that remain the same
    private tooltip: (d: any) => string = tooltipContent;
    private highlightColor: string = "#ffc107";
    private highlightColorFunc: (d: any) => string = d => d.included ? this.highlightColor : "lightgrey";
    private linkStrokeColor: (d: any) => string = ({ target: d }) => this.highlightColorFunc(d);
    private expandedItemsList = [];

    private highlightedTreeProcessor: HighlightedTreeProcessor = new HighlightedTreeProcessor();

    get pept2dataCommunicator(): Pept2DataCommunicator {
        return this.$store.getters.assayData(this.assay)?.pept2dataCommunicator;
    }

    get ncbiOntologyProcessor(): NcbiOntologyProcessor {
        return this.$store.getters["ncbi/ontology"](this.assay)?.processor;
    }

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
            this.assay.getSearchConfiguration()
        );

        const functionalSummaryProcessor = new FunctionalSummaryProcessor();
        const data = await functionalSummaryProcessor.summarizeFunctionalAnnotation(
            term.definition,
            peptideCounts,
            this.assay.getSearchConfiguration(),
            this.pept2dataCommunicator,
            this.ncbiOntologyProcessor
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
        this.highlightedTreeProcessor.computeHighlightedTree(
            this.itemToPeptidesMapping.get(term.code),
            this.tree,
            this.taxaToPeptidesMapping
        ).then(rootNode => this.treeAvailable.set(term, rootNode));
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
