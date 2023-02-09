<template>
    <div ref="wrapper">
        <v-stepper v-model="currentStep" class="heatmap-wizard" flat>
            <v-stepper-header>
                <v-stepper-step editable :complete="currentStep > 1" step="1">Horizontal axis</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step editable :complete="currentStep > 2" step="2">Normalisation</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step editable :complete="currentStep > 3" step="3">
                    Heatmap
                </v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
                <v-stepper-content step="1">
                    <DataSourceMulti
                        :loading="loading"
                        :assays="assays"
                        @select="verticalItems = $event"
                    />
                    <v-btn class="continue-button" color="primary" @click="currentStep = 2">Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content step="2">
                    <NormalizationSelector @update="normalizer = $event" />
                    <v-btn class="continue-button" color="primary" @click="currentStep = 3">Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content class="heatmap-stepper-content" step="3">
                    <VisualizationControls
                        ref="heatmap"
                        caption="Scroll to zoom, drag to pan"
                        :loading="heatMapLoading"
                        :fullscreen="() => toggle(heatmap)" 
                        :download="() => downloadModalOpen = true"
                        :reset="() => heatmapReset = true"
                        :rotate="() => isRotated = !isRotated"
                        :hideDownload="isFullscreen"
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
                                :download="downloadModalOpen"
                                @download="downloadModalOpen = $event"
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
import { MultiProteomicsAnalysisStatus } from '@/index';
import { Normalizer } from '@/logic';
import { computed, ref, watch } from 'vue';
import { VStepper, VStepperHeader, VStepperStep, VDivider, VStepperItems, VStepperContent, VBtn } from 'vuetify/lib';
import VisualizationControls from '../../VisualizationControls.vue';
import HeatMap from '../HeatMap.vue';
import NormalizationSelector from '../NormalizationSelector.vue';
import DataSourceMulti from './DataSourceMulti.vue';
import DataSourceMultiItem from './DataSourceMultiItem';

export interface Props {
    loading: boolean

    assays: MultiProteomicsAnalysisStatus[]
}

const props = defineProps<Props>();

const { isFullscreen, toggle } = useFullscreen();

const wrapper = ref<HTMLElement | null>(null);
const heatmap = ref<HTMLElement | null>(null);

const heatmapReset = ref<boolean>(false);

const currentStep = ref<number>(1);

const verticalItems = ref<DataSourceMultiItem[]>([]);

const normalizer = ref<Normalizer>();

const isRotated = ref<boolean>(false);

const heatMapLoading = computed(() => {
    return heatmapRows.value.length === 0 
        || heatmapColumns.value.length === 0 
        || currentStep.value < 3;
});

const heatmapRows = computed(() => verticalItems.value.map(item => item.name));
const heatmapColumns = computed(() =>  props.assays.map(assay => assay.assay.name));
const heatmapData = computed(() => {
    if (normalizer.value === undefined) {
        return [];
    }

    const data: number[][] = [];
    for (const verticalItem of verticalItems.value) {
        const row = [];
        for (const assay of props.assays) {
            row.push(verticalItem.assayCounts.get(assay.assay.id) ?? 0);
        }
        data.push(row);
    }

    return normalizer.value.normalize(data);
});

const downloadModalOpen = ref<boolean>(false);

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
