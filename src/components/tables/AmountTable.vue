<template>
    <v-data-table :headers="tableHeaders" :items="items" :items-per-page="5" item-key="code" show-expand :expanded.sync="expandedItemsList">
        <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
                <div v-if="computeTree(item) && treeAvailable.get(item)">
                    <treeview
                        :id="`TreeView-${item.code}`" 
                        :data="treeAvailable.get(item)" 
                        :height="310"
                        :width="800" 
                        :tooltip="tooltip" 
                        :colors="highlightColorFunc" 
                        :enableAutoExpand="0.3" 
                        :linkStrokeColor="linkStrokeColor" 
                        :nodeStrokeColor="highlightColorFunc" 
                        :nodeFillColor="highlightColorFunc">
                    </treeview>
                </div>
            </td>
        </template>
        <template v-slot:item.action="{ item }">
            <v-icon>mdi-download</v-icon>
        </template>
    </v-data-table>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import { toCSVString, logToGoogle } from "../../logic/utils";
    import { tooltipContent } from "../visualizations/VisualizationHelper";
    import Treeview from "../visualizations/Treeview.vue";
    import {Node} from "../../logic/data-management/Node";
    import FaSortSettings from "./FaSortSettings";
    import FAElement from "../../logic/functional-annotations/FAElement";
    import Sample from "../../logic/data-management/Sample";
    import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
    import Tree from "../../logic/data-management/Tree";

    @Component({
        components: {
            Treeview
        }
    })
    export default class AmountTable extends Vue {
        @Prop({required: true})
        protected items: FAElement[];
        @Prop({required: true})
        protected searchSettings: FaSortSettings;
        @Prop({required: true})
        protected taxaRetriever: (term: FAElement) => Promise<Node>;
        @Prop({required: true})
        protected annotationName: string;
        // Keeps track of the functional annotations for which a Tree has already been calculated.
        private treeAvailable: Map<FAElement, Node> = new Map();

        private tableHeaders = [{
            text: 'Peptides',
            align: 'left',
            value: 'popularity',
            width: '15%'
        }, {
            text: 'GO term',
            align: 'left',
            value: 'code',
            width: '30%'
        }, {
            text: 'Name',
            align: 'left',
            value: 'name',
            width: '45%'
        }, {
            text: 'Actions',
            align: 'center',
            width: '15%',
            sortable: false,
            value: 'action'
        }];

    
        // All settings for each Treeview that remain the same
        protected tooltip: (d: any) => string = tooltipContent;
        protected highlightColor: string = "#ffc107";
        protected highlightColorFunc: (d: any) => string = d => (d.included ? this.highlightColor : "lightgrey");
        protected linkStrokeColor: (d: any) => string = ({target: d}) => this.highlightColorFunc(d);
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
            })
            return true;
        }

        private getTaxa(term: FAElement): Node {
            return this.taxaRetriever(term);
        }

        private saveImage(term: FAElement): void {
            // @ts-ignores
            logToGoogle("Multi peptide", "Save Image for FA");
            // Hack to get a reference to the SVG DOM-element
            //@ts-ignore
            triggerDownloadModal(document.getElementById(`TreeView-${term.code}`).getElementsByTagName("svg")[0], null, `unipept_treeview_${goTerm.code}`);
        }

        private saveTableAsCSV(): void {
            let columnNames: string[] = ["Peptides", "GO term", "Name"];
            let grid: string[][] = this.items.map(term => [term.popularity.toString(), term.code, term.name]);
            // TODO: check!
            // downloadDataByForm(this.toCSV(columnNames, grid), "GO_terms-" + this.namespace.replace(" ", "_") + "-export.csv", "text/csv");
        }
    }
</script>

<style lang="less" scoped>
    @import './../../assets/style/amount-table.css.less';


</style>