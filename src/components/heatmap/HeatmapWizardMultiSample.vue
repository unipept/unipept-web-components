import {NormalizationType} from "./NormalizationType";

<template>
    <v-stepper v-model="currentStep" class="heatmap-wizard">
        <v-stepper-header>
            <v-stepper-step editable :complete="currentStep > 1" step="1">Data source</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 2" step="2">Normalisation</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 3" step="3">Heatmap</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
            <v-stepper-content step="1">
                <multi-assay-data-source
                    :assays="assays"
                    :communication-source="communicationSource"
                    v-on:selected-items="updateSelectedItems">
                </multi-assay-data-source>
                <v-spacer></v-spacer>
                <v-btn class="continue-button" color="primary" @click="currentStep++">Continue</v-btn>
            </v-stepper-content>
            <v-stepper-content step="2">
                <p>
                    Please select the type of normalization that should be performed before visualizing
                    data points.
                </p>
                <normalization-selector v-on:update-normalizer="updateNormalizer">
                </normalization-selector>
                <v-btn class="continue-button" color="primary" @click="currentStep++">Continue</v-btn>
            </v-stepper-content>
            <v-stepper-content step="3">
                <heatmap-multi-sample :selected-items="selectedItems" :assays="assays" :normalizer="normalizer">
                </heatmap-multi-sample>
            </v-stepper-content>
        </v-stepper-items>
    </v-stepper>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch, Prop } from "vue-property-decorator";
import HeatmapVisualization from "./HeatmapVisualization.vue";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import MultiAssayDataSource from "./MultiAssayDataSource.vue";
import ProteomicsCountTableProcessor from "./../../business/processors/ProteomicsCountTableProcessor";
import OntologyProcessor from "./../../business/ontology/OntologyProcessor";
import FunctionalDefinition from "./../../business/ontology/functional/FunctionalDefinition";
import NcbiTaxon from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import { OntologyIdType } from "./../../business/ontology/Ontology";
import MultiAssayDataSourceItem from "./MultiAssayDataSourceItem";
import Normalizer from "./../../business/normalisation/Normalizer";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";
import NormalizationSelector from "./NormalizationSelector.vue";
import HeatmapMultiSample from "./HeatmapMultiSample.vue";
import CommunicationSource from "@/business/communication/source/CommunicationSource";
import { AllNormalizer } from "@/business";

type DefinitionType = (FunctionalDefinition | NcbiTaxon)

type SourceMetadata = {
    items: MultiAssayDataSourceItem[],
    tableProcessor: (countTable: CountTable<Peptide>, config: SearchConfiguration) => ProteomicsCountTableProcessor<OntologyIdType>,
    ontologyProcessor: OntologyProcessor<OntologyIdType, DefinitionType>,
    loading: boolean,
    categories: string[],
    // What's the title of the category column that should be shown in the data table?
    categoryTitle: string,
    // Should the identifier be shown in the data source table instead of the category name?
    showIdentifier: boolean
};

@Component({
    components: { HeatmapMultiSample, NormalizationSelector, MultiAssayDataSource, HeatmapVisualization },
})
export default class HeatmapWizardMultiSample extends Vue {
    @Prop({ required: true })
    private assays: ProteomicsAssay[];
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

    private currentStep: number = 1;

    private selectedItems: MultiAssayDataSourceItem[] = [];
    private normalizer: Normalizer = new AllNormalizer();

    private updateSelectedItems(newItems: MultiAssayDataSourceItem[]) {
        this.selectedItems = newItems;
    }

    private updateNormalizer(normalizer: Normalizer) {
        this.normalizer = normalizer;
    }
}
</script>

<style>
    .v-stepper__wrapper {
        display: flex;
        flex-direction: column;
    }

    .continue-button {
        align-self: flex-end;
    }
</style>
