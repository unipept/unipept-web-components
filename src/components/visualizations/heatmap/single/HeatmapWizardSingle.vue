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
                    value="1"
                    :complete="currentStep > 1"
                />
                <v-divider />
                <v-stepper-item
                    editable
                    title="Horizontal axis"
                    value="2"
                    :complete="currentStep > 2"
                />
                <v-divider />
                <v-stepper-item
                    editable
                    title="Normalization"
                    value="3"
                    :complete="currentStep > 3"
                />
                <v-divider />
                <v-stepper-item
                    editable
                    title="Heatmap"
                    value="4"
                    :complete="currentStep > 4"
                />
            </v-stepper-header>
            <v-stepper-window>
                <v-stepper-window-item :value="1">
                    <DataSourceSingle
                        :loading="loading"
                        :go-count-table-processor="goCountTableProcessor"
                        :go-ontology="goOntology"
                        :ec-count-table-processor="ecCountTableProcessor"
                        :ec-ontology="ecOntology"
                        :interpro-count-table-processor="interproCountTableProcessor"
                        :interpro-ontology="interproOntology"
                        :ncbi-count-table-processor="ncbiCountTableProcessor"
                        :ncbi-ontology="ncbiOntology"
                        :ncbi-tree="ncbiTree"
                        @select="horizontalItems = $event"
                    />
                </v-stepper-window-item>
                <v-stepper-window-item :value="2">
                    <DataSourceSingle
                        :loading="loading"
                        :go-count-table-processor="goCountTableProcessor"
                        :go-ontology="goOntology"
                        :ec-count-table-processor="ecCountTableProcessor"
                        :ec-ontology="ecOntology"
                        :interpro-count-table-processor="interproCountTableProcessor"
                        :interpro-ontology="interproOntology"
                        :ncbi-count-table-processor="ncbiCountTableProcessor"
                        :ncbi-ontology="ncbiOntology"
                        :ncbi-tree="ncbiTree"
                        @select="verticalItems = $event"
                    />
                </v-stepper-window-item>
                <v-stepper-window-item :value="3">
                    <NormalizationSelector @update="normalizer = $event" />
                </v-stepper-window-item>
                <v-stepper-window-item :value="4">
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
import { EcCode, EcCountTableProcessor, EcDefinition, GoCode, GoCountTableProcessor, GoDefinition, InterproCode, InterproCountTableProcessor, InterproDefinition, LcaCountTableProcessor, NcbiId, NcbiTaxon, NcbiTree, Normalizer, Ontology } from '@/logic';
import { computed, ref, watch } from 'vue';
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
