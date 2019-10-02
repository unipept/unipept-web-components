<template>
  <v-container>
        <v-row>
            <v-col>
                <switch-dataset-card 
                    :selected-datasets="selectedDatasets"
                    v-on:activate-dataset="activateDataset" 
                    v-on:toggle-dataset-selection="toggleDatasetSelection">
                </switch-dataset-card>
            </v-col>
            <v-col>
                <experiment-summary-card v-if="!this.datasetSelectionInProgress"></experiment-summary-card>
                <load-datasets-card 
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
                <single-dataset-visualization-card :sample="this.activeDataset ? this.activeDataset.getDataset() : null">
                </single-dataset-visualization-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
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
import MpaAnalysisManager from '../../logic/data-management/MpaAnalysisManager';
import Sample from '../../logic/data-management/Sample';
import SingleDatasetVisualizationCard from '../visualizations/SingleDatasetVisualizationsCard.vue';

@Component({
    components: {
        SingleDatasetVisualizationCard
    }
})
export default class AnalysisComponent extends Vue {
    @Prop({required: true})
    private selectedDatasets: PeptideContainer[];
    @Prop({required: true})
    private storedDatasets: PeptideContainer[];

    private datasetSelectionInProgress: boolean = false;
    private activeDataset: PeptideContainer = null;

    mounted() {
        // Start analysis of every selected dataset.
        for (let dataset of this.selectedDatasets) {
            this.processDataset(dataset);
        }
    }

    private processDataset(dataset: PeptideContainer): void {
        let mpaManager = new MpaAnalysisManager();
        // TODO: work with the real search settings here
        mpaManager.processDataset(dataset, {
            il: true,
            dupes: true,
            missed: false
        }).then(() => {
            if (this.activeDataset === null) {
                this.activeDataset = dataset;
            }
        });
    }

    private activateDataset(dataset: PeptideContainer) {
        this.activeDataset = dataset;
    }

    private toggleDatasetSelection(status: boolean) {
        this.datasetSelectionInProgress = status;
    }

    private selectDataset(dataset: PeptideContainer) {
        this.selectedDatasets.push(dataset);
        this.processDataset(dataset);
    }

    private deselectDataset(dataset: PeptideContainer) {
        const idx: number = this.selectedDatasets.findIndex((val: PeptideContainer) => val.getId() === dataset.getId());
        if (idx >= 0) {
            this.selectedDatasets.splice(idx, 1);
        }
    }

    private storeDataset(dataset: PeptideContainer) {
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