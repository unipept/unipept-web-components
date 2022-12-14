<template>
    <div style="height: 100%;" v-if="!error">
        <div v-if="!visualizationComputed" class="d-flex loading-container">
            <v-progress-circular 
                :width="5" 
                :size="50" 
                color="primary" 
                indeterminate 
            />
        </div>
        <div once class="visualization-container" ref="visualization"></div>
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
import { Treemap as UnipeptTreemap, TreemapSettings } from 'unipept-visualizations';
import { onMounted, ref, watch } from 'vue';

export interface Props {
    data: NcbiTree

    width?: number
    height?: number
    autoResize?: boolean
    filterId: number
    // tooltip?: (node: DataNodeLike) => string
    // colors?: (node: TreeviewNode) => string

    loading?: boolean
    doReset?: boolean
    fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    height: 600,
    autoResize: false,
    filterId: 1,
    loading: false,
    doReset: false,
    fullscreen: false
});

const emits = defineEmits(["reset", "update-selected-taxon-id"]);

const visualization = ref<HTMLElement | null>(null);
const visualizationComputed = ref<UnipeptTreemap | undefined>(undefined);

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
    
    if(visualization.value) {
        visualization.value.innerHTML = "";
    }

    if(!props.loading && mounted.value) {
        visualizationComputed.value = initializeVisualisation();
        emits("update-selected-taxon-id", 1)
    }
});

// Watch wheter we have to perform a reset
watch(() => props.doReset, () => {
    emits("update-selected-taxon-id", 1)
    emits("reset", true);
});

// Watch wheter we have to perform a resize
watch(() => props.fullscreen, () => {
    if(visualizationComputed.value) {
        if(props.fullscreen) {
            console.log("fullscreen", visualization.value?.clientHeight);
            // @ts-ignore
            visualizationComputed.value.resize(visualization.value?.clientWidth, visualization.value?.clientHeight - 20);
        } else {
            // @ts-ignore
            visualizationComputed.value.resize(visualization.value?.clientWidth, props.height - 20);
        }
    }
});

watch(() => props.filterId, () => {
    if(visualizationComputed.value) {
        // @ts-ignore
        visualizationComputed.value.reroot(props.filterId, false);
    }
});

const initializeVisualisation = () => {
    error.value = false;

    let settings = {
        width: props.width ? props.width : visualization.value?.clientWidth,
        height: props.height - 20,
        rerootCallback: d => {
            if(visualizationComputed.value) {
                emits("update-selected-taxon-id", d.id);
            }
        }
    } as TreemapSettings;

    const treemap = new UnipeptTreemap(
        visualization.value as HTMLElement,
        props.data.getRoot(),
        settings,
    );

    // @ts-ignore
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
        width: 100%;
        height: 100%;
    }
</style>
