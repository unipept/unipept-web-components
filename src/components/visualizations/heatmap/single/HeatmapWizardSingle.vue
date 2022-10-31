<template>
    <div ref="wrapper">
        <v-stepper v-model="currentStep" class="heatmap-wizard">
            <v-stepper-header>
                <v-stepper-step editable :complete="currentStep > 1" step="1">Horizontal axis</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step editable :complete="currentStep > 2" step="2">Vertical axis</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step editable :complete="currentStep > 3" step="3">Normalisation</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step editable :complete="currentStep > 4" step="4">
                    Heatmap
                </v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
                <v-stepper-content step="1">
                    <DataSourceSingle
                        :loading="loading"
                        :goCountTableProcessor="goCountTableProcessor"
                        :goOntology="goOntology"
                        :ecCountTableProcessor="ecCountTableProcessor"
                        :ecOntology="ecOntology"
                        :interproCountTableProcessor="interproCountTableProcessor"
                        :interproOntology="interproOntology"
                        :ncbiCountTableProcessor="ncbiCountTableProcessor"
                        :ncbiOntology="ncbiOntology"
                        :ncbiTree="ncbiTree"
                        @select="horizontalItems = $event"
                    />
                    <v-btn class="continue-button" color="primary" @click="currentStep = 2">Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content step="2">
                    <DataSourceSingle
                        :loading="loading"
                        :goCountTableProcessor="goCountTableProcessor"
                        :goOntology="goOntology"
                        :ecCountTableProcessor="ecCountTableProcessor"
                        :ecOntology="ecOntology"
                        :interproCountTableProcessor="interproCountTableProcessor"
                        :interproOntology="interproOntology"
                        :ncbiCountTableProcessor="ncbiCountTableProcessor"
                        :ncbiOntology="ncbiOntology"
                        :ncbiTree="ncbiTree"
                        @select="verticalItems = $event"
                    />
                    <v-btn class="continue-button" color="primary" @click="currentStep = 3">Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content step="3">
                    <NormalizationSelector @update="normalizer = $event" />
                    <v-btn class="continue-button" color="primary" @click="currentStep = 4">Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content class="heatmap-stepper-content" step="4">
                    <VisualizationControls
                        ref="heatmap"
                        caption="Scroll to zoom, drag to pan"
                        :loading="heatMapLoading"
                        :fullscreen="() => toggle(heatmap)" 
                        :download="() => { }"
                        :reset="() => heatmapReset = true"
                        :rotate="() => isRotated = !isRotated"
                        overlap
                    >
                        <template #visualization>
                            <HeatMap
                                :data="heatmapData"
                                :row-labels="heatmapRows"
                                :column-labels="heatmapColumns"
                                :loading="heatMapLoading"
                                :width="wrapper?.clientWidth"
                                :fullscreen="isFullscreen"
                                :rotated="isRotated"
                                :doReset="heatmapReset"
                                @reset="heatmapReset = false"
                            />
                        </template>
                    </VisualizationControls>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </div>
</template>

<script setup lang="ts">
import useFullscreen from '@/composables/useFullscreen';
import { EcCode, EcCountTableProcessor, EcDefinition, GoCode, GoCountTableProcessor, GoDefinition, InterproCode, InterproCountTableProcessor, InterproDefinition, LcaCountTableProcessor, NcbiId, NcbiTaxon, NcbiTree, Normalizer, Ontology } from '@/logic';
import { computed, ref, watch } from 'vue';
import { VStepper, VStepperHeader, VStepperStep, VDivider, VStepperItems, VStepperContent, VBtn } from 'vuetify/lib';
import VisualizationControls from '../../VisualizationControls.vue';
import HeatMap from '../HeatMap.vue';
import NormalizationSelector from '../NormalizationSelector.vue';
import DataSourceSingle from './DataSourceSingle.vue';
import DataSourceSingleItem from './DataSourceSingleItem';

export interface Props {
    loading: boolean

    goCountTableProcessor: GoCountTableProcessor
    goOntology: Ontology<GoCode, GoDefinition>
    ecCountTableProcessor: EcCountTableProcessor
    ecOntology: Ontology<EcCode, EcDefinition>
    interproCountTableProcessor: InterproCountTableProcessor
    interproOntology: Ontology<InterproCode, InterproDefinition>
    ncbiCountTableProcessor: LcaCountTableProcessor
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>
    ncbiTree: NcbiTree
}

defineProps<Props>();

const { isFullscreen, toggle } = useFullscreen();

const wrapper = ref<HTMLElement | null>(null);
const heatmap = ref<HTMLElement | null>(null);

const heatmapReset = ref<boolean>(false);

const currentStep = ref<number>(1);

const horizontalItems = ref<DataSourceSingleItem[]>([]);
const verticalItems = ref<DataSourceSingleItem[]>([]);

const normalizer = ref<Normalizer>();

const isRotated = ref<boolean>(false);

const heatMapLoading = computed(() => {
    return heatmapRows.value.length === 0 
        || heatmapColumns.value.length === 0 
        || currentStep.value < 4;
});

const heatmapRows = computed(() => verticalItems.value.map(item => item.name));
const heatmapColumns = computed(() => horizontalItems.value.map(item => item.name));
const heatmapData = computed(() => {
    if (normalizer.value === undefined) {
        return [];
    }

    const data: number[][] = [];
    for (const verticalItem of verticalItems.value) {
        const row = [];
        for (const horizontalItem of horizontalItems.value) {
            row.push(horizontalItem.peptides.reduce((acc, peptide) => acc + (verticalItem.peptides.includes(peptide) ? 1 : 0), 0));
        }
        data.push(row);
    }

    return normalizer.value.normalize(data);
});

watch(currentStep, () => {
    if(currentStep.value < 4) {
        isRotated.value = false;
    }
});
</script>

<style>
.v-stepper__wrapper {
    display: flex;
    flex-direction: column;
}

.heatmap-stepper-content {
    height: 500px;
    padding: 0 !important;
}

.continue-button {
    align-self: flex-end;
}
.heatmap {
    display: flex;
}
.heatmap > svg {
    margin: auto;
}
</style>
