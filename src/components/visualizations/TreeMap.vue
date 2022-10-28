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
import { computed, onMounted, Ref, ref, watch } from 'vue';

export interface Props {
    data: NcbiTree

    width?: number
    height?: number
    autoResize?: boolean
    // tooltip?: (node: DataNodeLike) => string
    // colors?: (node: TreeviewNode) => string

    loading?: boolean
    doReset?: boolean
    fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    height: 600,
    autoResize: false,
    loading: false,
    doReset: false,
    fullscreen: false
});

const emits = defineEmits(["reset"]);

const visualization = ref<HTMLElement | null>(null);

const mounted = ref<boolean>(false);
const error = ref<boolean>(false);

const visualizationComputed: Ref<UnipeptTreemap | undefined> = computed(() => {
    // A tree is not computed if the visualization is not mounted or if the data is not set.
    if(props.loading || !mounted.value) {
        return undefined;
    }

    // When the visualization is mounted, the tree can be computed.
    return initializeVisualisation();
});

// Watch wheter we have to perform a reset
watch(() => props.doReset, () => {
    if(visualizationComputed.value) {
        // @ts-ignore
        visualizationComputed.value.reset();

        // Let the parent component know that the reset has been performed
        emits("reset", true);
    }
});

// Watch wheter we have to perform a resize
watch(() => props.fullscreen, () => {
    if(visualizationComputed.value) {
        if(props.fullscreen) {
            // @ts-ignore
            visualizationComputed.value.resize(visualization.value?.clientWidth, visualization.value?.clientHeight - 20);
        } else {
            // @ts-ignore
            visualizationComputed.value.resize(visualization.value?.clientWidth, props.height - 20);
        }
    }
});

const initializeVisualisation = () => {
    error.value = false;

    let settings = {
        width: props.width ? props.width : visualization.value?.clientWidth,
        height: props.height - 20
    } as TreemapSettings;

    const treeview = new UnipeptTreemap(
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

    return treeview;
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
