<template>
    <amount-table :items="items" :loading="loading" annotation-name="EC number" :searchSettings="searchSettings" :taxaRetriever="taxaRetriever" :summaryRetriever="summaryRetriever"></amount-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import EcNumber from "../../logic/functional-annotations/EcNumber";
import { Node } from "../../logic/data-management/Node";
import { EcNameSpace } from "../../logic/functional-annotations/EcNameSpace";
import Treeview from "../../components/visualizations/Treeview.vue";
import AmountTable from "./AmountTable.vue";
import DataRepository from "../../logic/data-source/DataRepository";
import EcDataSource from "../../logic/data-source/EcDataSource";
import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
import FaSortSettings from "./FaSortSettings";

@Component({
    components: {
        AmountTable
    }
})
export default class EcAmountTable extends Vue {
    @Prop({ required: true })
    private items: EcNumber[]
    @Prop({ required: true })
    private searchSettings: FaSortSettings;
    // The Sample that should be summarized in this AmountTable.
    @Prop({ required: true })
    private dataRepository: DataRepository;
    @Prop({ required: false, default: false })
    private loading: boolean;

    private async taxaRetriever(number: EcNumber): Promise<Node> {
        if (this.dataRepository) {
            let ecDataSource: EcDataSource = await this.dataRepository.createEcDataSource();
            let taxaDataSource: TaxaDataSource = await this.dataRepository.createTaxaDataSource();
            return await taxaDataSource.getTreeByPeptides(ecDataSource.getPeptidesByEcNumber(number));
        }
    }

    private async summaryRetriever(number: EcNumber): Promise<string[][]> {
        if (this.dataRepository) {
            let ecDataSource: EcDataSource = await this.dataRepository.createEcDataSource();
            return ecDataSource.getECNumberSummary(number);
        }
        return []
    }
}
</script>

<style scoped>
</style>