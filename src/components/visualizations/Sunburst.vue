<template>
    <div
        v-if="!error"
        style="height: inherit;"
    >
        <div
            v-if="!visualizationComputed"
            class="d-flex loading-container"
        >
            <v-progress-circular
                :width="5"
                :size="50"
                color="primary"
                indeterminate
            />
        </div>
        <div
            ref="visualization"
            style="height: inherit;"
            class="visualization-container"
        />
    </div>
    <v-container
        v-else
        fluid
        class="error-container mt-2 d-flex align-center"
    >
        <div class="d-flex flex-column align-center">
            <v-icon
                size="x-large"
                color="error"
            >
                mdi-alert-circle-outline
            </v-icon>
            <span>
                An error occurred during the analysis of this assay.
            </span>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import { NcbiTree } from '@/logic';
import { Sunburst as UnipeptSunburst, SunburstSettings } from 'unipept-visualizations';
import { onMounted, ref, watch } from 'vue';
import { tooltipContent } from './VisualizationHelper';

// The amount of milliseconds that the SunBurst should wait with animating movement before or after a filter was
// changed.
const rerootTimeout = 0;

export interface Props {
    data: NcbiTree

    width?: number
    height?: number
    autoResize?: boolean
    isFixedColors?: boolean
    filterId: number

    loading?: boolean
    doReset?: boolean
    error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    width: 800,
    height: 300,
    autoResize: false,
    isFixedColors: false,
    filterId: 1,
    loading: false,
    doReset: false,
    error: false
});

const emits = defineEmits(["reset", "update-selected-taxon-id"]);

const visualization = ref<HTMLElement | null>(null);
const visualizationComputed = ref<UnipeptSunburst | undefined>(undefined);


watch(() => props.loading, () => {
    if(props.loading) {
        visualizationComputed.value = undefined;
    }

    if(!visualizationComputed.value) {
        visualizationComputed.value = initializeVisualisation();
    }
});

watch(() => props.data, () => {
    if(!props.loading) {
        visualizationComputed.value = initializeVisualisation();

        emits("update-selected-taxon-id", 1);
    }
});

// Watch wheter we have to perform a reset
watch(() => props.doReset, () => {
    emits("update-selected-taxon-id", 1);
    emits("reset", true);
});

watch(() => props.filterId, () => {
    new Promise<void>((resolve) => setTimeout(resolve, rerootTimeout)).then(() => {
        if (visualizationComputed.value) {
            // @ts-ignore (reroot is not exported in the interface of the visualization)
            visualizationComputed.value.reroot(props.filterId, false);
        }
    });
});

watch(() => props.isFixedColors, () => {
    visualizationComputed.value = initializeVisualisation();
    // @ts-ignore (reroot is not exported as part of the interface of the visualization)
    visualizationComputed.value.reroot(props.filterId, false);
});

const initializeVisualisation = () => {
    visualizationComputed.value = undefined;

    if(!props.data) return;

    const settings = {
        width: props.width,
        height: props.height,
        useFixedColors: props.isFixedColors,
        rerootCallback: d => {
            // Wait 500ms to start the animation to avoid stutter in the interface.
            new Promise(resolve => setTimeout(resolve, rerootTimeout)).then(() => {
                if (visualizationComputed.value) {
                    emits("update-selected-taxon-id", d.id);
                }
            });
        },
        getTooltipText: d => tooltipContent(d)
    } as SunburstSettings;

    const sunburst = new UnipeptSunburst(
        visualization.value as HTMLElement,
        props.data.getRoot(),
        settings,
    );

    if (props.autoResize) {
        const svgEl = visualization.value?.querySelector("svg");
        if(svgEl) {
            svgEl.setAttribute("height", "100%");
            svgEl.setAttribute("width", "100%");
        }
    }

    return sunburst;
}

onMounted(() => {
    if(!props.loading) {
        visualizationComputed.value = initializeVisualisation();
    }
});
</script>

<style scoped>
    .error-container {
        max-width: 600px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
    }

    .loading-container {
        height: inherit;
        align-items: center;
        justify-content: center;
    }

   .visualization-container {
        display: flex;
        flex-direction: row-reverse;
    }

    .sunburst {
        display: flex;
        flex-direction: row-reverse;
        width: 100% !important;
    }

    .sunburst:deep(.sunburst-breadcrumbs) {
        margin-top: 75px !important;
    }
</style>
