<template>
    <amount-table :items="items" :searchSettings="searchSettings" :taxaRetriever="taxaRetriever"></amount-table>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import EcNumber from "@/logic/functional-annotations/EcNumber";
    import {Node} from "@/logic/data-management/Node";
    import { EcNameSpace } from "@/logic/functional-annotations/EcNameSpace";
    import Treeview from "@/components/visualizations/Treeview.vue";
    import AmountTable from "./AmountTable.vue";
    import Sample from "@/logic/data-management/Sample";
    import TaxaDataSource from "@/logic/data-source/TaxaDataSource";
    import FaSortSettings from "./FaSortSettings";

    @Component({
        components: {
            AmountTable
        }
    })
    export default class EcAmountTable extends Vue {
        @Prop({required: true})
        private items: EcNumber[]
        @Prop({required: true})
        private searchSettings: FaSortSettings;

        private taxaRetriever: (term: EcNumber) => Promise<Node> = (term: EcNumber) => this.getTaxaTreeByTerm(term);

        protected async getTaxaTreeByTerm(term: EcNumber): Promise<Node> {
            let sample: Sample = this.$store.getters.activeDataset.getDataset();
            let taxaDataSource: TaxaDataSource = await sample.dataRepository.createTaxaDataSource();
            return taxaDataSource.getTreeByEcNumber(term);
        }
    }
</script>

<style scoped>
</style>