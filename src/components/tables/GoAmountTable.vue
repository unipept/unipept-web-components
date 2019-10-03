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

        mounted() {
            console.log(this.items);
        }

        private taxaRetriever: (term: GoTerm) => Promise<Node> = (term: GoTerm) => this.getTaxaTreeByTerm(term);

        private async getTaxaTreeByTerm(term: GoTerm): Promise<Node> {
            let taxaDataSource: TaxaDataSource = await this.sample.dataRepository.createTaxaDataSource();
            let tree = taxaDataSource.getTreeByGoTerm(term);
            console.log(tree);
            return tree;
        }
    }
</script>

<style scoped>
</style>
