<template>
    <div
        v-if="!error"
        style="height: 100%;"
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
            v-once
            ref="visualization"
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
import { Treemap as UnipeptTreemap, TreemapSettings } from 'unipept-visualizations';
import { onMounted, ref, watch } from 'vue';
import { tooltipContent } from './VisualizationHelper';

export interface Props {
    data: NcbiTree

    width?: number
    height?: number
    autoResize?: boolean
    filterId: number

    loading?: boolean
    doReset?: boolean
    fullscreen?: boolean,

    error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    height: 600,
    autoResize: false,
    filterId: 1,
    loading: false,
    doReset: false,
    fullscreen: false,
    error: false
});

// TODO these should also be properly typed.
const emits = defineEmits(["reset", "update-selected-taxon-id"]);

const visualization = ref<HTMLElement | null>(null);
const visualizationComputed = ref<UnipeptTreemap | undefined>(undefined);

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

// Watch wheter we have to perform a resize
watch(() => props.fullscreen, () => {
    if(visualizationComputed.value) {
        if(props.fullscreen) {
            // @ts-ignore (ideally, in the future we should here if visualization actually has a value)
            visualizationComputed.value.resize(visualization.value?.clientWidth, visualization.value?.clientHeight - 20);
        } else {
            // @ts-ignore (ideally, in the future we should here if visualization actually has a value)
            visualizationComputed.value.resize(visualization.value?.clientWidth, props.height - 20);
        }
    }
});

// Watch wheter we have to perform a reset
watch(() => props.doReset, () => {
    emits("update-selected-taxon-id", 1)
    emits("reset", true);
});

watch(() => props.filterId, () => {
    if(visualizationComputed.value) {
        // @ts-ignore (reroot does exit on this value, but is not exposed in the interface)
        visualizationComputed.value.reroot(props.filterId, false);
    }
});

const initializeVisualisation = () => {
    visualizationComputed.value = undefined;
    if(visualization.value) {
        visualization.value.innerHTML = "";
    }

    const settings = {
        width: props.width ? props.width : visualization.value?.clientWidth,
        height: props.height - 20,
        rerootCallback: d => {
            if(visualizationComputed.value) {
                emits("update-selected-taxon-id", d.id);
            }
        },
        getTooltipText: d => tooltipContent(d)
    } as TreemapSettings;

    const treemap = new UnipeptTreemap(
        visualization.value as HTMLElement,
        props.data.getRoot(),
        settings,
    );

    // @ts-ignore (reroot does exist on this value, but is not exposed by the interface)
    treemap.reroot(props.filterId);

    if (props.autoResize) {
        const svgEl = visualization.value?.querySelector("svg");
        if(svgEl) {
            svgEl.setAttribute("height", "100%");
            svgEl.setAttribute("width", "100%");
        }
    }

    return treemap;
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
        width: 100%;
        height: 100%;
    }
</style>
