<template>
    <div style="height: inherit;">
        <div v-if="!visualizationComputed" class="d-flex loading-container">
            Please select at least one item for both axis of the heatmap.
        </div>
        <div class="visualization-container" ref="visualization"></div>

        <DownloadImageModal 
            :openModal="downloadModalOpen"
            :imageSource="heatmapElement()"
            @close="downloadModalOpen = false"
            supportsSvg
        />
    </div>
</template>

<script setup lang="ts">
import DownloadImageModal from '@/components/modals/DownloadImageModal.vue';
import SvgImageSource from '@/logic/util/image/SvgImageSource';
import SvgStringImageSource from '@/logic/util/image/SvgStringImageSource';
import { Heatmap as UnipeptHeatmap, HeatmapSettings } from 'unipept-visualizations';
import { computed, onMounted, Ref, ref, watch } from 'vue';

export interface Props {
    data: number[][]
    rowLabels: string[]
    columnLabels: string[]

    width?: number
    height?: number

    loading?: boolean
    doReset?: boolean
    clusterRows?: boolean
    clusterColumns?: boolean
    rotated?: boolean
    fullscreen?: boolean
    download?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    width: 400,
    height: 600,

    loading: false,
    doReset: false,
    clusterRows: true,
    clusterColumns: true,
    rotated: false,
    fullscreen: false,
    download: false,
});

const emits = defineEmits(["reset", "download"]);

const visualization = ref<HTMLElement | null>(null);

const mounted = ref<boolean>(false);

const visualizationComputed: Ref<UnipeptHeatmap | undefined> = computed(() => {
    if(!mounted) {
        return undefined;
    }

    if(props.loading) {
        if(visualization.value) {
            visualization.value.innerHTML = "";
        }

        return undefined;
    }

    return initializeVisualisation();
});

const downloadModalOpen = ref<boolean>(false);

// @ts-ignore
const heatmapElement = () => new SvgStringImageSource(visualizationComputed.value?.toSVG());

// Watch wheter we have to perform a reset
watch(() => props.doReset, () => {
    if(visualizationComputed.value) {
        // @ts-ignore
        visualizationComputed.value.reset();

        if(props.fullscreen) {
            // @ts-ignore
            visualizationComputed.value.resize(visualization.value?.clientWidth, visualization.value?.clientHeight);
        }

        // Let the parent component know that the reset has been performed
        emits("reset", true);
    }
});

// Watch wheter we have to perform a resize
watch(() => props.fullscreen, () => {
    if(visualizationComputed.value) {
        if(props.fullscreen) {
            // @ts-ignore
            visualizationComputed.value.resize(visualization.value?.clientWidth, visualization.value?.clientHeight);
        } else {
            // @ts-ignore
            visualizationComputed.value.resize(props.width, props.height);
        }
    }
});

watch(() => props.download, () => {
    downloadModalOpen.value = props.download;
});

watch(() => downloadModalOpen.value, () => {
    emits("download", downloadModalOpen.value);
});

const initializeVisualisation = () => {
    const settings = {
        width: props.fullscreen ? visualization.value?.clientWidth : props.width,
        height: props.fullscreen ? visualization.value?.clientHeight : props.height,
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
        width: 100%;
        height: 100%;
    }
</style>
