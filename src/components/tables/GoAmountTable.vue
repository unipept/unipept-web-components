<template>
    <amount-table :items="items" :searchSettings="searchSettings" :taxaRetriever="taxaRetriever"></amount-table>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import GoTerm from "../../logic/functional-annotations/GoTerm";
    import { tooltipContent } from "../../components/visualizations/VisualizationHelper";
    import Sample from "../../logic/data-management/Sample";
    import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
    import Treeview from "../visualizations/treeview.vue";
    import AmountTable from "./AmountTable.vue";
    import { downloadDataByForm, logToGoogle, triggerDownloadModal } from "../../logic/utils";
    import { GoNameSpace } from "../../logic/functional-annotations/GoNameSpace";
    import FaSortSettings from "./FaSortSettings";
    import {Node} from "../../logic/data-management/Node";
    import FAElement from "../../logic/functional-annotations/FAElement";

    @Component({
        components: {
            AmountTable
        }
    })
    export default class GoAmountTable extends Vue {
        @Prop({required: true})
        private items: GoTerm[]
        @Prop({required: true})
        private searchSettings: FaSortSettings;
        @Prop({required: true})
        private namespace: GoNameSpace;
        // The Sample that should be summarized in this AmountTable
        @Prop({required: true})
        private sample: Sample;

        private nodePerTerm: Map<GoTerm, Node> = new Map();

        mounted() {
            this.sample.dataRepository.createTaxaDataSource().then((dataSource: TaxaDataSource) => {
                for (let term of this.items) {
                    dataSource.getTreeByGoTerm(term).then((node: Node) => {
                        this.nodePerTerm.set(term, node);
                    })
                }
            })
        }

        private taxaRetriever: (term: GoTerm) => Node = (term: GoTerm) => this.nodePerTerm.get(term);
    }
</script>

<style scoped>
</style>
