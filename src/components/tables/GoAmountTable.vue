<template>
    <amount-table :items="items" annotation-name="GO term" :namespace="namespace" :searchSettings="searchSettings" :taxaRetriever="taxaRetriever"></amount-table>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import GoTerm from "../../logic/functional-annotations/GoTerm";
    import { tooltipContent } from "../../components/visualizations/VisualizationHelper";
    import DataRepository from "../../logic/data-source/DataRepository";
    import GoDataSource from "../../logic/data-source/GoDataSource";
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
        private dataRepository: DataRepository;

        private async taxaRetriever(term: GoTerm): Promise<Node> 
        {
            if(this.dataRepository)
            {
                let taxaDataSource: TaxaDataSource =  await this.dataRepository.createTaxaDataSource()
                let goDataSource: GoDataSource = await this.dataRepository.createGoDataSource();
                return await taxaDataSource.getTreeByPeptides(goDataSource.getPeptidesByGoTerm(term));
            }
        }
    }
</script>

<style scoped>
</style>
