<template>
    <div>
        <v-data-table :headers="tableHeaders" :loading="loading" :items="items" :items-per-page="5" item-key="code" show-expand :expanded.sync="expandedItemsList">
            <template v-slot:top>
                <v-tooltip :open-delay=1000 bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon @click="saveTableAsCSV()" class="table-to-csv-button" v-on="on">mdi-download</v-icon>
                    </template>
                    <span>Download table as CSV</span>
                </v-tooltip>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
                <td class="item-treeview" :colspan="headers.length">
                    <div v-if="treeAvailable.get(item) || computeTree(item)">
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
                        <v-icon @click="saveSummaryAsCSV(item)" class="row-to-csv-button" v-on="on">mdi-download</v-icon>
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
import { downloadDataByForm, toCSVString, logToGoogle } from "../../logic/utils";
import { tooltipContent } from "../visualizations/VisualizationHelper";
import Treeview from "../visualizations/Treeview.vue";
import { Node } from "../../logic/data-management/Node";
import FaSortSettings from "./FaSortSettings";
import FAElement from "../../logic/functional-annotations/FAElement";
import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
import Tree from "../../logic/data-management/Tree";
import ImageDownloadModal from "../utils/ImageDownloadModal.vue";

@Component({
    components: {
        Treeview,
        ImageDownloadModal
    },
    computed: 
    {
        tableHeaders: function() {
            return [{
                text: this.searchSettings.name,
                align: "left",
                value: this.searchSettings.field,
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
        protected items: FAElement[];
        @Prop({ required: true })
        protected searchSettings: FaSortSettings;
        @Prop({ required: true })
        protected taxaRetriever: (term: FAElement) => Promise<Node>;
        @Prop({ required: true })
        protected summaryRetriever: (term: FAElement) => Promise<string[][]>;
        @Prop({ required: true })
        protected annotationName: string;
        @Prop({ required: false })
        protected namespace: string;
        @Prop({ required: false, default: false })
        protected loading: boolean;

        // Keeps track of the functional annotations for which a Tree has already been calculated.
        private treeAvailable: Map<FAElement, Node> = new Map();
    
        // All settings for each Treeview that remain the same
        protected tooltip: (d: any) => string = tooltipContent;
        protected highlightColor: string = "#ffc107";
        protected highlightColorFunc: (d: any) => string = d => (d.included ? this.highlightColor : "lightgrey");
        protected linkStrokeColor: (d: any) => string = ({ target: d }) => this.highlightColorFunc(d);
        protected expandedItemsList = [];

        public toCSV(columnNames: string[], columnValues: string[][]): string {
            columnValues.unshift(columnNames);
            return toCSVString(columnValues);
        }
        /**
         * This function is called by the DataTable whenever it requests a tree. This function then asynchronously
         * computes this tree and fills in the associated entry in the treeAvailable map. The DataTable watches
         * changes in this map and reacts appropriatly.
         */
        private computeTree(term: FAElement): boolean {
            this.taxaRetriever(term).then((node) => {
                this.treeAvailable.set(term, node);
            }).catch(err => console.error(err));
            return true;
        }

        private treeViewId(term: FAElement) {
            return "TreeView-" + term.code.replace(/[.:]/g, "-")
        }
        
        private saveImage(term: FAElement): void {
            // @ts-ignores
            logToGoogle("Multi peptide", "Save Image for FA");
            let downloadModal = this.$refs.imageDownloadModal as ImageDownloadModal;
            downloadModal.downloadSVG("unipept_treeview_" + term.code.replace(":", "_"), "#" + this.treeViewId(term) + " svg")
        }

        private saveTableAsCSV(): void {
            let columnNames: string[] = ["Peptides", this.annotationName, "Name"];
            let grid: string[][] = this.items.map(term => [term.popularity.toString(), term.code, term.name]);
            downloadDataByForm(this.toCSV(columnNames, grid), this.annotationName.replace(/ /g, "_") + (this.namespace? "-" + this.namespace: "") + "-export.csv", "text/csv");
        }

        private async saveSummaryAsCSV(term: FAElement) {
            let data = await this.summaryRetriever(term)
            downloadDataByForm(toCSVString(data), term.code.replace(/:/g, "_") + ".csv", "text/csv");
        }
}
</script>

<style lang="less" scoped>
    @import './../../assets/style/amount-table.css.less';
</style>
