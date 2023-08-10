<template>
    <div ref="wrapper">
        <v-stepper
            v-model="currentStep"
            class="heatmap-wizard"
        >
            <v-stepper-header>
                <v-stepper-item
                    editable
                    title="Horizontal axis"
                    :complete="currentStep > 1"
                    step="1"
                />
                <v-divider />
                <v-stepper-item
                    editable
                    title="Normalization"
                    :complete="currentStep > 2"
                    step="2"
                />
                <v-divider />
                <v-stepper-item
                    editable
                    title="Heatmap"
                    :complete="currentStep > 3"
                    step="3"
                />
            </v-stepper-header>
            <v-stepper-window>
                <v-stepper-window-item :value="1">
                    <DataSourceMulti
                        :loading="loading"
                        :assays="assays"
                        @select="verticalItems = $event"
                    />
                </v-stepper-window-item>
                <v-stepper-window-item :value="2">
                    <NormalizationSelector @update="normalizer = $event" />
                </v-stepper-window-item>
                <v-stepper-window-item :value="3">
                    <VisualizationControls
                        ref="heatmap"
                        caption="Scroll to zoom, drag to pan"
                        :loading="heatMapLoading"
                        :fullscreen="() => toggle(heatmap)"
                        :download="() => downloadModalOpen = true"
                        :reset="() => heatmapReset = true"
                        :rotate="() => isRotated = !isRotated"
                        :hide-download="isFullscreen"
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
                                :do-reset="heatmapReset"
                                :download="downloadModalOpen"
                                @reset="heatmapReset = false"
                                @download="downloadModalOpen = $event"
                            />
                        </template>
                    </VisualizationControls>
                </v-stepper-window-item>
            </v-stepper-window>
            <v-stepper-actions
                @click:prev="currentStep -= 1"
                @click:next="currentStep += 1"
            />
        </v-stepper>
    </div>
</template>

<script setup lang="ts">
import useFullscreen from '@/composables/useFullscreen';
import { Normalizer } from '@/logic';
import { computed, ref, watch } from 'vue';
import VisualizationControls from '../../VisualizationControls.vue';
import HeatMap from '../HeatMap.vue';
import NormalizationSelector from '../NormalizationSelector.vue';
import DataSourceMulti from './DataSourceMulti.vue';
import DataSourceMultiItem from './DataSourceMultiItem';
import MultiProteomicsAnalysisStatus from "@/interface/MultiProteomicsAnalysisStatus";

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
