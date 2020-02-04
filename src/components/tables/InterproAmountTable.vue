<template>
    <amount-table 
        :items="items" 
        :loading="loading" 
        annotation-name="Entry" 
        :searchSettings="searchSettings" 
        :taxaRetriever="taxaRetriever" 
        :summaryRetriever="summaryRetriever">
    </amount-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
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
import InterproEntry from "../../logic/functional-annotations/InterproEntry";
import InterproDataSource from "../../logic/data-source/InterproDataSource";

@Component({
    components: {
        AmountTable
    }
})
export default class GoAmountTable extends Vue {
    @Prop({ required: true })
    private items: InterproEntry[]
    @Prop({ required: true })
    private searchSettings: FaSortSettings;
    // The sample that should be summarized in this AmountTable
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: true })
    private dataRepository: DataRepository;

    private async taxaRetriever(entry: InterproEntry): Promise<Node> {
        if (this.dataRepository) {
            const taxaDataSource: TaxaDataSource =  await this.dataRepository.createTaxaDataSource()
            const interproSource: InterproDataSource = await this.dataRepository.createInterproDataSource();
            return await taxaDataSource.getTreeByPeptides(interproSource.getPeptidesByInterproEntry(entry));
        }
    }

    private async summaryRetriever(entry: InterproEntry): Promise<string[][]> {
        if (this.dataRepository) {
            const interproSource: InterproDataSource = await this.dataRepository.createInterproDataSource();
            return interproSource.getInterproSummary(entry);
        }
        return []
    }
}
</script>

<style scoped>
</style>
