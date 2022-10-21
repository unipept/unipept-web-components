<template>
    <v-card>
        <v-tabs 
            slider-color="secondary" 
            background-color="primary" 
            dark 
            v-model="currentTab"
        >
            <v-tab>Sunburst</v-tab>
            <v-tab>Treemap</v-tab>
            <v-tab>Treeview</v-tab>
            <v-tab>Hierarchical outline</v-tab>
            <v-tab>Heatmap</v-tab>
        </v-tabs>

        <v-tabs-items class="mb-5" v-model="currentTab">
            <v-tab-item>
                <VisualizationControls
                    ref="sunburst"
                    caption="Click a slice to zoom in and the center node to zoom out"
                    :loading="analysisInProgress"
                    :fullscreen="() => toggle(sunburst)" 
                    :download="() => downloadSvg(sunburst, 'sunburst.svg')"
                    :reset="() => sunburstReset = true"
                >
                    <template #visualization>
                        <Sunburst
                            :data="taxaTree"
                            :loading="analysisInProgress || !taxaTree"
                            :autoResize="true"
                            :height="500"
                            :doReset="sunburstReset"
                            @reset="sunburstReset = false"
                        />
                    </template>
                </VisualizationControls>
            </v-tab-item>
            <v-tab-item>
                <VisualizationControls
                    ref="treemap"
                    caption="Click a square to zoom in and right click to zoom out"
                    :loading="analysisInProgress"
                    :overlap="false"
                    :fullscreen="() => toggle(treemap)" 
                    :download="() => downloadSvg(treemap, 'treemap.svg')"
                    :reset="() => treemapReset = true"
                >
                    <template #visualization>
                        <TreeMap
                            :data="taxaTree"
                            :loading="analysisInProgress || !taxaTree"
                            :autoResize="true"
                            :doReset="treemapReset"
                            @reset="treemapReset = false"
                            :fullscreen="isFullscreen"
                        />
                    </template>
                </VisualizationControls>
            </v-tab-item>
            <v-tab-item>
                <VisualizationControls
                    ref="treeview"
                    caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
                    :loading="analysisInProgress"
                    :fullscreen="() => toggle(treeview)" 
                    :download="() => downloadSvg(treeview, 'treeview.svg')"
                    :reset="() => treeviewReset = true"
                >
                    <template #visualization>
                        <TreeView 
                            :data="ecTree"
                            :loading="analysisInProgress || !ecTree"
                            :autoResize="true"
                            :height="400"
                            :doReset="treeviewReset"
                            @reset="treeviewReset = false"
                        />
                    </template>
                </VisualizationControls>
            </v-tab-item>
            <v-tab-item>
                <div></div>
            </v-tab-item>
            <v-tab-item>
                <div></div>
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script setup lang="ts">
import useFullscreen from '@/composables/useFullscreen';
import useSvgDownload from '@/composables/useSvgDownload';
import { DataNodeLike } from 'unipept-visualizations/types';
import { ref } from 'vue';
import VisualizationControls from '../visualizations/VisualizationControls.vue';
import TreeView from '../visualizations/TreeView.vue';
import Sunburst from '../visualizations/Sunburst.vue';
import { NcbiTree } from '@/logic';
import TreeMap from '../visualizations/TreeMap.vue';

export interface Props {
    analysisInProgress: boolean
    ecTree: DataNodeLike
    taxaTree: NcbiTree
}

defineProps<Props>();

const currentTab = ref<number>(0);

const treeview = ref<HTMLElement | null>(null);
const sunburst = ref<HTMLElement | null>(null);
const treemap  = ref<HTMLElement | null>(null);

const { isFullscreen, toggle } = useFullscreen();
const { download } = useSvgDownload();

const downloadSvg = (element: HTMLElement | null, filename: string) => {
    if (element) {
        // @ts-ignore
        const svg = element.$el.querySelector("svg");
        download(svg, filename);
    }
}

const treeviewReset = ref<boolean>(false);
const sunburstReset = ref<boolean>(false);
const treemapReset  = ref<boolean>(false);

//const treemapFullscreen = ref<boolean>(false);
</script>