<template>
    <div style="height: inherit;">
        <div v-if="!visualizationComputed" class="d-flex loading-container">
            Please select at least one item for both axis of the heatmap.
        </div>
        <div class="visualization-container" ref="visualization"></div>
    </div>
</template>

<script setup lang="ts">
import { Heatmap as UnipeptHeatmap, HeatmapSettings } from 'unipept-visualizations';
import { computed, onMounted, Ref, ref, watch } from 'vue';

export interface Props {
    data: number[][]
    rowLabels: string[]
    columnLabels: string[]

    width?: number

    loading?: boolean
    doReset?: boolean
    clusterRows?: boolean
    clusterColumns?: boolean
    rotated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    width: 400,

    loading: false,
    doReset: false,
    clusterRows: true,
    clusterColumns: true,
    rotated: false
});

const emits = defineEmits(["reset"]);

const visualization = ref<HTMLElement | null>(null);

const mounted = ref<boolean>(false);

const visualizationComputed: Ref<UnipeptHeatmap | undefined> = computed(() => {
    if(props.loading || !mounted.value) {
        return undefined;
    }

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

const initializeVisualisation = () => {
    const settings = {
        width: props.width,
        height: 500,
        dendrogramEnabled: true
    } as HeatmapSettings

    const rows = props.rotated ? props.columnLabels : props.rowLabels;
    const columns = props.rotated ? props.rowLabels : props.columnLabels;

    const heatmapData = props.rotated ? props.data[0].map((_, ci) => props.data.map(r => r[ci])) : props.data;

    const heatmap = new UnipeptHeatmap(
        visualization.value as HTMLElement,
        heatmapData,
        rows,
        columns,
        settings
    );

    console.log(visualization.value)

    if(props.clusterRows && !props.clusterColumns) {
        heatmap.cluster("rows");
    } else if(!props.clusterRows && props.clusterColumns) {
        heatmap.cluster("columns");
    } else if(!props.clusterRows && !props.clusterColumns) {
        heatmap.cluster("none");
    } else {
        heatmap.cluster("all");
    }

    return heatmap;
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
        padding: 24px 24px 16px 24px;
    }

   .visualization-container {
        max-height: 600px;
    }
</style>
