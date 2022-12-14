<template>
    <div style="height: inherit;" v-if="!error">
        <div v-if="!visualizationComputed" class="d-flex loading-container">
            <v-progress-circular 
                :width="5" 
                :size="50" 
                color="primary" 
                indeterminate 
            />
        </div>
        <div style="height: inherit;" class="visualization-container" ref="visualization"></div>
    </div>
    <v-container fluid v-else class="error-container mt-2 d-flex align-center">
        <div class="error-container">
            <v-icon x-large>
                mdi-alert-circle-outline
            </v-icon>
            <p>
                You're trying to visualise a very large sample. This will work in most cases, but it could take
                some time to render. Are you sure you want to <a @click="initializeVisualisation()">continue</a>?
            </p>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import { NcbiTree } from '@/logic';
import { Sunburst as UnipeptSunburst, SunburstSettings } from 'unipept-visualizations';
import { computed, onMounted, Ref, ref, watch } from 'vue';

export interface Props {
    data: NcbiTree

    width?: number
    height?: number
    autoResize?: boolean
    isFixedColors?: boolean
    filterId: number
    // tooltip?: (node: DataNodeLike) => string
    // colors?: (node: TreeviewNode) => string

    loading?: boolean
    doReset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    width: 800,
    height: 300,
    autoResize: false,
    isFixedColors: false,
    filterId: 1,
    loading: false,
    doReset: false
});

const emits = defineEmits(["reset", "update-selected-taxon-id"]);

const visualization = ref<HTMLElement | null>(null);
const visualizationComputed = ref<UnipeptSunburst | undefined>(undefined);

const mounted = ref<boolean>(false);
const error = ref<boolean>(false);

watch([() => props.loading, mounted], () => {
    // A tree is not computed if the visualization is not mounted or if the data is not set.
    if(props.loading || !mounted.value) {
        visualizationComputed.value = undefined;
    }

    if(!visualizationComputed.value) {
        visualizationComputed.value = initializeVisualisation();
    }
});

watch(() => props.data, () => {
    visualizationComputed.value = undefined;

    if(!props.loading && mounted.value) {
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
    if(visualizationComputed.value) {
        // @ts-ignore
        visualizationComputed.value.reroot(props.filterId, false);
    }
});

watch(() => props.isFixedColors, () => {
    visualizationComputed.value = undefined;
    // @ts-ignore
    visualizationComputed.value = initializeVisualisation();
    // @ts-ignore
    visualizationComputed.value.reroot(props.filterId, false);
});

const initializeVisualisation = () => {
    error.value = false;

    let settings = {
        width: props.width,
        height: props.height,
        useFixedColors: props.isFixedColors,
        rerootCallback: d => {
            if(visualizationComputed.value) {
                emits("update-selected-taxon-id", d.id);
            }
        }
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
    mounted.value = true;
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
