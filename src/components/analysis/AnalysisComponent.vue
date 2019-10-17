<template>
  <v-container fluid>
        <v-row>
            <v-col>
                <switch-dataset-card 
                    :selected-datasets="selectedDatasets"
                    :active-dataset.sync="activeDataset" 
                    v-on:toggle-dataset-selection="toggleDatasetSelection">
                </switch-dataset-card>
            </v-col>
            <v-col>
                <experiment-summary-card v-if="!this.datasetSelectionInProgress"></experiment-summary-card>
                <load-datasets-card
                    :selected-datasets="selectedDatasets"
                    :stored-datasets="storedDatasets" 
                    v-on:select-dataset="selectDataset"
                    v-on:deselect-dataset="deselectDataset"
                    v-on:store-dataset="storeDataset"
                    v-else>
                </load-datasets-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <single-dataset-visualization-card :dataRepository="this.activeDataset ? this.activeDataset.dataRepository : null" :analysisInProgress="this.datasetsInProgress > 0">
                </single-dataset-visualization-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <functional-summary-card :dataRepository="this.activeDataset ? this.activeDataset.dataRepository : null" :analysisInProgress="this.datasetsInProgress > 0">
                </functional-summary-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import SwitchDatasetCard from "./../dataset/SwitchDatasetCard.vue";
import ExperimentSummaryCard from "./../analysis/functional/ExperimentSummaryCard.vue"
import LoadDatasetsCard from "./../dataset/LoadDatasetsCard.vue";
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import Assay from "../../logic/data-management/assay/Assay";
import MpaAnalysisManager from '../../logic/data-management/MpaAnalysisManager';
import SingleDatasetVisualizationCard from '../visualizations/SingleDatasetVisualizationsCard.vue';
import FunctionalSummaryCard from './functional/FunctionalSummaryCard.vue';

@Component({
    components: {
        SwitchDatasetCard,
        SingleDatasetVisualizationCard,
        LoadDatasetsCard,
        ExperimentSummaryCard,
        FunctionalSummaryCard
    }
})
export default class AnalysisComponent extends Vue {
    @Prop({required: true})
    private selectedDatasets: Assay[];
    @Prop({required: true})
    private storedDatasets: Assay[];

    private datasetSelectionInProgress: boolean = false;
    private activeDataset: Assay = null;
    private datasetsInProgress: number = 0;

    mounted() {
        // Start analysis of every selected dataset.
        for (let dataset of this.selectedDatasets) {
            this.datasetsInProgress += 1;
            this.processDataset(dataset);
        }
    }

    private processDataset(dataset: Assay): void {
        let mpaManager = new MpaAnalysisManager();
        // TODO: work with the real search settings here
        mpaManager.processDataset(dataset, {
            il: true,
            dupes: true,
            missed: false
        }).then(() => {
            if (!this.activeDataset) {
                console.log("Set active dataset:");
                console.log(dataset);
                this.activeDataset = dataset;
            }
            this.datasetsInProgress -= 1;
        });
    }

    private activateDataset(dataset: Assay) {
        this.activeDataset = dataset;
    }

    private toggleDatasetSelection(status: boolean) {
        this.datasetSelectionInProgress = status;
    }

    private selectDataset(dataset: Assay) {
        this.selectedDatasets.push(dataset);
        this.processDataset(dataset);
        this.$emit('select-dataset', dataset);
    }

    private deselectDataset(dataset: Assay) {
        const idx: number = this.selectedDatasets.findIndex((val: Assay) => val.getId() === dataset.getId());
        if (idx >= 0) {
            this.selectedDatasets.splice(idx, 1);
        }
    }

    private storeDataset(dataset: Assay) {
        // TODO implement this function!
    }
}
</script>

<style lang="less">
    .v-divider {
        margin-top: 15px;
        margin-bottom: 15px; 
    }

    .unipept-sunburst {
        width: 100% !important;
    }
</style>
