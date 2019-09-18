<template>
  <v-container>
        <v-row>
            <v-col>
                <switch-dataset-card 
                    :selected-datasets="selectedDatasets"
                    v-on:activate-dataset="datasetActivated" 
                    v-on:toggle-dataset-selection="toggleDatasetSelection">
                </switch-dataset-card>
            </v-col>
            <v-col>
                <experiment-summary-card v-if="!this.datasetSelectionInProgress"></experiment-summary-card>
                <load-datasets-card v-else></load-datasets-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import SwitchDatasetCard from "./SwitchDatasetCard.vue";
import ExperimentSummaryCard from "./../analysis/functional/ExperimentSummaryCard.vue"
import LoadDatasetsCard from "./LoadDatasetsCard.vue";
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import PeptideContainer from './../../logic/data-management/PeptideContainer';

@Component
export default class AnalysisComponent extends Vue {
    @Prop({required: true})
    private selectedDatasets: PeptideContainer[];

    private datasetSelectionInProgress: boolean = false;
    private activeDataset: PeptideContainer;

    private datasetActivated(dataset: PeptideContainer) {
        this.activeDataset = dataset;
    }

    private toggleDatasetSelection(status: boolean) {
        this.datasetSelectionInProgress = status;
    }
}
</script>

<style>

</style>