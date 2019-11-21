<template>
    <amount-table :items="items" :loading="loading" annotation-name="GO term" :namespace="namespace" :searchSettings="searchSettings" :taxaRetriever="taxaRetriever" :summaryRetriever="summaryRetriever"></amount-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import GoTerm from "../../logic/functional-annotations/GoTerm";
import { tooltipContent } from "../../components/visualizations/VisualizationHelper";
import DataRepository from "../../logic/data-source/DataRepository";
import GoDataSource from "../../logic/data-source/GoDataSource";
import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
import Treeview from "../visualizations/treeview.vue";
import AmountTable from "./AmountTable.vue";
import { downloadDataByForm, logToGoogle } from "../../logic/utils";
import { GoNameSpace } from "../../logic/functional-annotations/GoNameSpace";
import FaSortSettings from "./FaSortSettings";
import { Node } from "../../logic/data-management/Node";
import FAElement from "../../logic/functional-annotations/FAElement";

@Component({
    components: {
        AmountTable
    }
})
export default class GoAmountTable extends Vue {
    @Prop({ required: true })
    private items: GoTerm[]
    @Prop({ required: true })
    private searchSettings: FaSortSettings;
    @Prop({ required: true })
    private namespace: GoNameSpace;
    // The sample that should be summarized in this AmountTable
    @Prop({ required: true })
    @Prop({ required: false, default: false })
    private loading: boolean;

    private dataRepository: DataRepository;

    private async taxaRetriever(term: GoTerm): Promise<Node> {
        if (this.dataRepository) {
            let taxaDataSource: TaxaDataSource =  await this.dataRepository.createTaxaDataSource()
            let goDataSource: GoDataSource = await this.dataRepository.createGoDataSource();
            return await taxaDataSource.getTreeByPeptides(goDataSource.getPeptidesByGoTerm(term));
        }
    }

    private async summaryRetriever(term: GoTerm): Promise<string[][]> {
        if (this.dataRepository) {
            let goDataSource: GoDataSource = await this.dataRepository.createGoDataSource();
            return goDataSource.getGoTermSummary(term);
        }
        return []
    }
}
</script>

<style scoped>
</style>
