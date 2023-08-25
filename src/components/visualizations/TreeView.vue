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
            :style="'height: ' + height + 'px'"
            class="treeview-container"
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
import { DataNodeLike, Treeview as UnipeptTreeView, TreeviewSettings } from 'unipept-visualizations';
import { onMounted, ref, watch } from 'vue';
import { tooltipContent } from './VisualizationHelper';

export interface Props {
    data: DataNodeLike

    width?: number
    height?: number
    autoResize?: boolean
    loading?: boolean
    doReset?: boolean

    error?: boolean

    linkStrokeColor?: (d: any) => string
    nodeStrokeColor?: (d: any) => string
    nodeFillColor?: (d: any) => string
}

const props = withDefaults(defineProps<Props>(), {
    width: 800,
    height: 300,
    autoResize: false,
    loading: false,
    doReset: false,
    error: false
});

const emits = defineEmits(["reset"]);

const visualization = ref<HTMLElement | null>(null);
const visualizationComputed = ref<UnipeptTreeView | undefined>();

watch(() => props.loading, () => {
    if(props.loading || !props.data) {
        visualizationComputed.value = undefined;
    }

    if(!visualizationComputed.value) {
        visualizationComputed.value = initializeVisualisation();
    }
});

watch(() => props.data, () => {
    if(!props.loading) {
        visualizationComputed.value = initializeVisualisation();
    }
});

// Watch whether we have to perform a reset
watch(() => props.doReset, () => {
    if (visualizationComputed.value) {
        // @ts-ignore (This function has not been exposed by the UnipeptTreeView class, but it is available)
        visualizationComputed.value.reset();

        // Let the parent component know that the reset has been performed
        emits("reset", true);
    }
});

const initializeVisualisation = () => {
    const settings = {
        width: props.width,
        height: props.height,
        getTooltipText: d => tooltipContent(d)
    } as TreeviewSettings;

    // Add the settings that are passed as props
    if (props.linkStrokeColor) {
        settings.linkStrokeColor = props.linkStrokeColor;
    }
    if (props.nodeStrokeColor) {
        settings.nodeStrokeColor = props.nodeStrokeColor;
    }
    if (props.nodeFillColor) {
        settings.nodeFillColor = props.nodeFillColor;
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
    if(!props.loading && props.data) {
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

.treeview-container svg {
    width: 100%;
    max-height: 600px;
}
</style>
