<template>
    <div>
        <v-data-table
            :headers="tableHeaders"
            :loading="loading"
            :items="items"
            :items-per-page="rowsPerPage"
            :server-items-length="totalItems"
            :options.sync="options"
            item-key="code"
            :show-expand="itemsToPeptides !== undefined && taxaToPeptides !== undefined && tree !== undefined"
            :expanded.sync="expandedItemsList"
            ref="dataTable">
            <template v-slot:header.action>
                <tooltip message="Download table as CSV">
                    <v-icon @click="saveTableAsCsv()">mdi-download</v-icon>
                </tooltip>
            </template>
            <!-- We can only process the tree when a mapping between items and peptides is given -->
            <template
                v-slot:expanded-item="{ headers, item }"
                v-if="itemsToPeptides !== undefined && taxaToPeptides !== undefined">
                <td class="item-treeview" :colspan="headers.length">
                    <div v-if="tree &&
                        expandedItemsList.indexOf(item) !== -1 &&
                        (computedTrees.indexOf(item.code) !== -1 || computeTree(item))
                    ">
                        <v-btn small depressed class="item-treeview-dl-btn" @click="saveImage(item)">
                            <v-icon>mdi-download</v-icon>
                            Save as image
                        </v-btn>
                        <treeview
                            :id="treeViewId(item)"
                            :data="treeAvailable.get(item)"
                            :autoResize="true"
                            :height="300"
                            :width="visualizationWidth"
                            :tooltip="tooltip"
                            :colors="highlightColorFunc"
                            :enableAutoExpand="true"
                            :linkStrokeColor="linkStrokeColor"
                            :nodeStrokeColor="highlightColorFunc"
                            :nodeFillColor="highlightColorFunc">
                        </treeview>
                        <div v-if="computedTrees.indexOf(item.code) === -1" class="d-flex justify-center align-center">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </div>
                    </div>
                </td>
            </template>
            <template v-slot:item.count="{ item }">
                <div :style="{
                        padding: '12px',
                        background: 'linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ' +
                            item.relativeCount * 100 + '%, rgba(255,255,255,0) ' + item.relativeCount * 100 + '%)',
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
                <tooltip
                    v-if="itemToCsvSummary !== undefined"
                    message="Download CSV summary of the filtered functional annotation">
                    <v-btn icon @click="itemToCsvSummary(item.code)">
                        <v-icon>
                            mdi-download
                        </v-icon>
                    </v-btn>
                </tooltip>
            </template>
        </v-data-table>
        <image-download-modal
            v-model="downloadImageModalOpen"
            :svg-string="imageSvg"
            :png-source="imagePngSource"
            :base-file-name="imageBaseName"
        />
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
import NetworkUtils from "./../../business/communication/NetworkUtils";
import CsvUtils from "./../../business/storage/CsvUtils";
import Tree from "./../../business/ontology/taxonomic/Tree";
import TreeNode from "./../../business/ontology/taxonomic/TreeNode";
import AnalyticsUtil from "./../../business/analytics/AnalyticsUtil";
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import HighlightedTreeProcessor from "./../../business/processors/taxonomic/ncbi/HighlightedTreeProcessor";
import { FunctionalCode } from "@/business";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import AmountTableItem from "@/components/tables/AmountTableItem";
import Tooltip from "@/components/custom/Tooltip.vue";
import PngSource from "@/business/image/PngSource";
import SvgUtils from "@/business/image/SvgUtils";
import SvgElementToPngSource from "@/business/image/SvgElementToPngSource";

@Component({
    components: {
        Treeview,
        Tooltip,
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
        dataTable: Vue
    }

    /*******************************************************************************************************************
     *  Properties that are always required for this AmountTable to function.
     ******************************************************************************************************************/

    @Prop({ required: true })
    private itemRetriever: AmountTableItemRetriever<any, any>;
    /**
     * Name of the annotation type as it should be used in the table header and the title of the CSV-export for this
     * table. (E.g. GO-term, EC-number, ...)
     */
    @Prop({ required: true })
    private annotationName: string;
    /**
     * A function that maps a functional code onto a URL to an external service that provides more information about the
     * given code.
     */
    @Prop({ required: true })
    private externalUrlConstructor: (code: FunctionalCode) => string;

    /*******************************************************************************************************************
     * Properties that are required to display the functional <-> taxonomical link (e.g. the taxonomic tree per table
     * item, etc.) If these are not all present, this link will not be presented by the table.
     ******************************************************************************************************************/

    /**
     * Maps a functional annotation onto all peptides that are annotated with this annotation. This property is required
     * for the functional <-> taxonomical link to be displayed!
     */
    @Prop({ required: false })
    private itemsToPeptides: Map<FunctionalCode, Peptide[]>;
    /**
     * Maps a taxon identifier onto all peptides that belong to this taxon. This property is required for the functional
     * <-> taxonomical link to be displayed!
     */
    @Prop({ required: false })
    private taxaToPeptides: Map<NcbiId, Peptide[]>;
    /**
     * A taxonomic tree computed from the assay that's currently being rendered. This property is required for the
     * functional <-> taxonomical link to be displayed!
     */
    @Prop({ required: false })
    private tree: Tree;

    /*******************************************************************************************************************
     * Properties required to export a CSV summary per item.
     ******************************************************************************************************************/

    /**
     * Function that downloads a CSV summary for the given functional code. If this function is not present, no download
     * button per row will be provided by the amount table.
     */
    @Prop({ required: false })
    private itemToCsvSummary: (code: FunctionalCode) => Promise<void>;

    /*******************************************************************************************************************
     * Properties that are purely esthetically or that can be used to further tune the AmountTable.
     ******************************************************************************************************************/

    /**
     * What items are being displayed as counts? (e.g. peptides, proteins, ...)
     */
    @Prop({ required: false, default: "Peptides" })
    protected countName: string;
    /**
     * If only items from a specific namespace are displayed, then please also provide the namespace that's being used.
     * This name is used to properly construct the export filename.
     */
    @Prop({ required: false })
    protected namespace: string;
    /**
     * Should the namespace column be displayed as part of the amount table?
     */
    @Prop({ required: false, default: false })
    private showNamespace: boolean;
    /**
     * Should the loading status of the table be activated?
     */
    @Prop({ required: false, default: false })
    protected loading: boolean;
    /**
     * Do we display the absolute or relative counts for peptides and proteins in the table? Absolute counts will be
     * used if this property is set to false.
     */
    @Prop({ required: false, default: false })
    protected showPercentage: boolean;
    /**
     * How many table rows should be displayed per page?
     */
    @Prop({ required: false, default: 5 })
    private rowsPerPage: number;

    private items: AmountTableItem[] = [];
    private totalItems: number = 0;

    private treeAvailable = new Map<AmountTableItem, TreeNode>();
    private computedTrees: string[] = [];

    private imageSvg: string = "";
    private imagePngSource: PngSource = null;
    private downloadImageModalOpen = false;
    private imageBaseName: string = "";

    private visualizationWidth: number = 0;

    private options = {};

    // All settings for each Treeview that remain the same
    private tooltip: (d: any) => string = tooltipContent;
    private highlightColor: string = "#ffc107";
    private highlightColorFunc: (d: any) => string = d => d.included ? this.highlightColor : "lightgrey";
    private linkStrokeColor: (d: any) => string = ({ target: d }) => this.highlightColorFunc(d);
    private expandedItemsList = [];

    private highlightedTreeProcessor: HighlightedTreeProcessor = new HighlightedTreeProcessor();

    private mounted() {
        this.visualizationWidth = this.$refs.dataTable.$el.clientWidth;
    }

    @Watch("tree")
    private onTreeChanged() {
        this.treeAvailable.clear();
        this.computedTrees.splice(0, this.computedTrees.length);
    }

    @Watch("itemRetriever")
    private async onItemRetrieverChanged() {
        this.items.splice(0, this.items.length);
        this.totalItems = 0;
        if (this.itemRetriever) {
            this.totalItems = this.itemRetriever.getItemCount();
            await this.onOptionsChanged({
                page: 1,
                itemsPerPage: this.rowsPerPage,
                sortBy: [],
                sortDesc: [],
                multiSort: false,
                mustSort: false,
                groupBy: [],
                groupDesc: []
            });
        }
    }

    @Watch("options", { deep: true })
    private async onOptionsChanged(newOptions) {
        if (this.itemRetriever) {
            this.items.splice(0, this.items.length);
            this.items.push(...this.itemRetriever.getItems(newOptions));
        }
    }

    /**
     * This function is called by the DataTable whenever it requests a tree. This function then asynchronously
     * computes this tree and fills in the associated entry in the treeAvailable map. The DataTable watches
     * changes in this map and reacts appropriately.
     */
    private computeTree(term: AmountTableItem): boolean {
        if (this.taxaToPeptides) {
            this.highlightedTreeProcessor.computeHighlightedTree(
                this.itemsToPeptides.get(term.code),
                this.tree,
                this.taxaToPeptides
            ).then(rootNode => {
                this.treeAvailable.set(term, rootNode);
                this.computedTrees.push(term.code);
            });
        }
        return true;
    }

    private treeViewId(term: AmountTableItem): string {
        return "TreeView-" + term.code.replace(/[.:]/g, "-");
    }

    private saveImage(term: AmountTableItem): void {
        AnalyticsUtil.logToGoogle("Multi peptide", "Save Image for FA");
        const svgElement = document.getElementById(`${this.treeViewId(term)}`)
            .getElementsByTagName("svg")
            .item(0);
        this.imageSvg = SvgUtils.elementToSvgDataUrl(svgElement);
        this.imagePngSource = new SvgElementToPngSource(svgElement);
        this.imageBaseName = "unipept_treeview_" + term.code.replace(":", "_");
        this.downloadImageModalOpen = true;
    }

    private async saveTableAsCsv(): Promise<void> {
        const columnNames = ["Peptides", this.annotationName, "Name"];
        let grid: string[][] = this.items.map(item => [item.count.toString(), item.code, item.name]);
        grid = [columnNames].concat(grid);
        await NetworkUtils.downloadDataByForm(
            CsvUtils.toCsvString(grid),
            this.annotationName.replace(/ /g, "_") + (this.namespace? "-" + this.namespace: "") + "-export.csv",
            "text/csv"
        );
    }
}
</script>

<style lang="less" scoped>
    @import './../../assets/style/amount-table.css.less';

    td.item-treeview {
        padding: 0 !important;
    }
</style>
