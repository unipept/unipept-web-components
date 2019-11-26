<template>
    <div>
        <span v-if="!dataset">No dataset is selected... Wait for at least one dataset to be loaded or select one.</span>
        <span v-else-if="!loading" style="position: relative; left: 50%; transform: translateX(-50%);">
            <v-progress-circular :size="50" :width="5" color="primary"></v-progress-circular>
        </span>
        <span v-else>
            We managed to match {{ matchedPeptides }} of your {{ searchedPeptides }} peptides.
            Unfortunately, <a style="cursor: pointer;" @click="showNotFoundPeptidesModal">{{ missedPeptides.length }}</a> peptides couldn't be found.
        </span>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Watch, Prop, Component } from "vue-property-decorator";
import Assay from "./../../../logic/data-management/assay/Assay";
import TaxaDataSource from "../../../logic/data-source/TaxaDataSource";

@Component
export default class ExperimentSummaryContent extends Vue {
    @Prop({ required: true })
    private dataset: Assay;

    private searchedPeptides: number = 0;
    private matchedPeptides: number = 0;
    private missedPeptides: string[] = [];

    private loading: boolean = true;

    private mounted() {
        console.log("summary");
        console.log(this.dataset);
        this.onDatasetChanged();
    }
    
    @Watch("dataset")
    private async onDatasetChanged(): Promise<void> {
        if (this.dataset) {
            this.loading = true;
            let taxaSource: TaxaDataSource = await this.dataset.dataRepository.createTaxaDataSource();
            this.searchedPeptides = await taxaSource.getAmountOfSearchedPeptides();
            this.matchedPeptides = await taxaSource.getAmountOfMatchedPeptides();
            this.missedPeptides = await taxaSource.getMissedPeptides();
            this.loading = false;
        }
    }
}
</script>

<style>

</style>