<template>
    <div style="height: inherit;" v-if="!error">
        <div v-if="!treeComputed" class="d-flex loading-container">
            <v-progress-circular 
                :width="5" 
                :size="50" 
                color="primary" 
                indeterminate 
            />
        </div>
        <div style="height: inherit;" class="treeview-container" ref="visualization"></div>
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
import { DataNodeLike, Treeview as UnipeptTreeView, TreeviewSettings } from 'unipept-visualizations';
import TreeviewNode from 'unipept-visualizations/types/visualizations/treeview/TreeviewNode';
import { computed, onMounted, Ref, ref, watch } from 'vue';

export interface Props {
    data: DataNodeLike

    width?: number
    height?: number
    autoResize?: boolean
    tooltip?: (node: DataNodeLike) => string
    colors?: (node: TreeviewNode) => string

    loading?: boolean
    doReset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    width: 800,
    height: 300,
    autoResize: false,
    loading: false,
    doReset: false
});

const emits = defineEmits(["reset"]);

const visualization = ref<HTMLElement | null>(null);

const mounted = ref<boolean>(false);
const error = ref<boolean>(false);

const treeComputed: Ref<UnipeptTreeView | undefined> = computed(() => {
    // A tree is not computed if the visualization is not mounted or if the data is not set.
    if(props.loading || !mounted.value || !props.data) {
        return undefined;
    }

    // When the visualization is mounted, the tree can be computed.
    return initializeVisualisation();
});

// Watch wheter we have to perform a reset
watch(() => props.doReset, () => {
    if(treeComputed.value) {
        // @ts-ignore
        treeComputed.value.reset();

        // Let the parent component know that the reset has been performed
        emits("reset", true);
    }
});

const initializeVisualisation = () => {
    error.value = false;

    let settings = {
        width: props.width,
        height: props.height,
    } as TreeviewSettings;

    if(props.tooltip) {
        settings = { ...settings, getTooltip: props.tooltip };
    }

    if(props.colors) {
        settings = { ...settings, colorProvider: props.colors };
    }

    const treeview = new UnipeptTreeView(
        visualization.value as HTMLElement,
        props.data,
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

   .treeview-container svg {
        width: 100%;
        max-height: 600px;
    }
</style>
