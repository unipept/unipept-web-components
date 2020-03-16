<template>
    <div>
        <v-data-table
            :headers="tableHeaders"
            :loading="loading"
            :items="items"
            :items-per-page="5"
            item-key="code"
            show-expand
            :expanded.sync="expandedItemsList">
            <template v-slot:top>
                <v-tooltip :open-delay=1000 bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon @click="saveTableAsCsv()" class="table-to-csv-button" v-on="on">mdi-download</v-icon>
                    </template>
                    <span>Download table as CSV</span>
                </v-tooltip>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
                <td class="item-treeview" :colspan="headers.length">
                    <div v-if="computeTree(item) && treeAvailable.get(item)">
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
            <template v-slot:[`item.${searchSettings.field}`]="{ item }">
                <div :style="{
                        padding: '12px',
                        background: 'linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ' + item.fractionOfPepts * 100 + '%, rgba(255,255,255,0) ' + item.fractionOfPepts * 100 + '%)',
                    }">
                    {{searchSettings.format(item)}}
                </div>
            </template>
            <template v-slot:Name="{ item }">
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
import NcbiCountTableProcessor from "./../../business/processors/taxonomic/ncbi/NcbiCountTableProcessor";
import Tree from "./../../business/ontology/taxonomic/Tree";
import NcbiOntologyProcessor from "./../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import TreeNode from "./../../business/ontology/taxonomic/TreeNode";
import AnalyticsUtil from "./../../business/analytics/AnalyticsUtil";

@Component({
    components: {
        Treeview,
        ImageDownloadModal
    },
    computed:
    {
        tableHeaders: function() {
            return [{
                text: "Peptides",
                align: "left",
                value: "count",
                width: "20%"
            }, {
                text: this.annotationName,
                align: "left",
                value: "code",
                width: "30%"
            }, {
                text: "Name",
                align: "left",
                value: "name",
                width: "40%"
            }, {
                text: "Actions",
                align: "center",
                width: "15%",
                sortable: false,
                value: "action"
            }]
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

    @Prop({ required: false })
    protected namespace: string;
    @Prop({ required: false })
    protected searchConfiguration: SearchConfiguration;
    @Prop({ required: false })
    protected itemToPeptidesMapping: Map<string, Peptide[]>;
    @Prop({ required: false, default: false })
    protected loading: boolean;

    protected treeAvailable = new Map<TableItem, TreeNode>();

    // All settings for each Treeview that remain the same
    protected tooltip: (d: any) => string = tooltipContent;
    protected highlightColor: string = "#ffc107";
    protected highlightColorFunc: (d: any) => string = d => (d.included ? this.highlightColor : "lightgrey");
    protected linkStrokeColor: (d: any) => string = ({ target: d }) => this.highlightColorFunc(d);
    protected expandedItemsList = [];

    private async saveTableAsCsv(): Promise<void> {
        const columnNames = ["Peptides", this.annotationName, "Name"];
        let grid: string[][] = this.items.map(item => [item.count.toString(), item.code, item.name]);
        grid = columnNames.concat(grid);
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

    /**
     * This function is called by the DataTable whenever it requests a tree. This function then asynchronously
     * computes this tree and fills in the associated entry in the treeAvailable map. The DataTable watches
     * changes in this map and reacts appropriately.
     */
    private computeTree(term: TableItem): boolean {
        const peptideTableProcessor = new PeptideCountTableProcessor();
        peptideTableProcessor.getPeptideCountTable(
            this.itemToPeptidesMapping.get(term.code),
            this.searchConfiguration
        ).then(async(peptideCounts) => {
            const taxaProcessor = new NcbiCountTableProcessor(peptideCounts, this.searchConfiguration);
            const countTable = await taxaProcessor.getLcaCountTable();

            const taxaOntologyProcessor = new NcbiOntologyProcessor();
            const taxaOntology = await taxaOntologyProcessor.getOntology(countTable);

            const tree = new Tree(countTable, taxaOntology);
            this.treeAvailable.set(term, tree.getRoot());
        });
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
