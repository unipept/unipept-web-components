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
            <v-tab-item class="fixed-height">
                <VisualizationControls
                    ref="sunburst"
                    caption="Click a slice to zoom in and the center node to zoom out"
                    :loading="analysisInProgress"
                    :fullscreen="() => toggle(sunburst)" 
                    :download="() => downloadSunburstModalOpen = true"
                    :reset="() => sunburstReset = true"
                    :hideDownload="isFullscreen"
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
            <v-tab-item class="fixed-height">
                <VisualizationControls
                    ref="treemap"
                    caption="Click a square to zoom in and right click to zoom out"
                    :loading="analysisInProgress"
                    :overlap="false"
                    :fullscreen="() => toggle(treemap)" 
                    :download="() => downloadTreemapModalOpen = true"
                    :reset="() => treemapReset = true"
                    :hideDownload="isFullscreen"
                >
                    <template #visualization>
                        <TreeMap
                            :data="taxaTree"
                            :loading="analysisInProgress || !taxaTree"
                            :height="460"
                            :autoResize="true"
                            :doReset="treemapReset"
                            @reset="treemapReset = false"
                            :fullscreen="isFullscreen && currentTab === 1"
                        />
                    </template>
                </VisualizationControls>
            </v-tab-item>
            <v-tab-item class="fixed-height">
                <VisualizationControls
                    ref="treeview"
                    caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
                    :loading="analysisInProgress"
                    :fullscreen="() => toggle(treeview)" 
                    :download="() => downloadTreeviewModalOpen = true"
                    :reset="() => treeviewReset = true"
                    :hideDownload="isFullscreen"
                >
                    <template #visualization>
                        <TreeView 
                            :data="ecTree"
                            :loading="analysisInProgress || !ecTree"
                            :autoResize="true"
                            :height="500"
                            :doReset="treeviewReset"
                            @reset="treeviewReset = false"
                        />
                    </template>
                </VisualizationControls>
            </v-tab-item>
            <v-tab-item class="pa-5">
                <HierarchicalOutline :tree="taxaTree" :equate-il="true" :loading="analysisInProgress" />
            </v-tab-item>
            <v-tab-item>
                <HeatmapWizardSingle 
                    :loading="analysisInProgress"
                    :goCountTableProcessor="goCountTableProcessor"
                    :goOntology="goOntology"
                    :ecCountTableProcessor="ecCountTableProcessor"
                    :ecOntology="ecOntology"
                    :interproCountTableProcessor="interproCountTableProcessor"
                    :interproOntology="interproOntology"
                    :ncbiCountTableProcessor="ncbiCountTableProcessor"
                    :ncbiOntology="ncbiOntology"
                    :ncbiTree="ncbiTree"
                />
            </v-tab-item>
        </v-tabs-items>

        <DownloadImageModal 
            :openModal="downloadSunburstModalOpen"
            :imageSource="sunburstElement()"
            @close="downloadSunburstModalOpen = false"
            supportsSvg
        />

        <DownloadImageModal 
            :openModal="downloadTreemapModalOpen"
            :imageSource="treemapElement()"
            @close="downloadTreemapModalOpen = false"
        />

        <DownloadImageModal 
            :openModal="downloadTreeviewModalOpen"
            :imageSource="treeviewElement()"
            @close="downloadTreeviewModalOpen = false"
            supportsSvg
        />
    </v-card>
</template>

<script setup lang="ts">
import useFullscreen from '@/composables/useFullscreen';
import { DataNodeLike } from 'unipept-visualizations/types';
import { ref } from 'vue';
import VisualizationControls from '../visualizations/VisualizationControls.vue';
import TreeView from '../visualizations/TreeView.vue';
import Sunburst from '../visualizations/Sunburst.vue';
import { EcCode, EcCountTableProcessor, EcDefinition, GoCode, GoCountTableProcessor, GoDefinition, InterproCode, InterproCountTableProcessor, InterproDefinition, LcaCountTableProcessor, NcbiId, NcbiTaxon, NcbiTree, Ontology } from '@/logic';
import TreeMap from '../visualizations/TreeMap.vue';
import HeatmapWizardSingle from '../visualizations/heatmap/single/HeatmapWizardSingle.vue';
import { VCard, VTabs, VTab, VTabsItems, VTabItem } from 'vuetify/lib';
import DownloadImageModal from '../modals/DownloadImageModal.vue';
import DomImageSource from '@/logic/util/image/DomImageSource';
import SvgImageSource from '@/logic/util/image/SvgImageSource';
import HierarchicalOutline from '../visualizations/HierarchicalOutline.vue';

export interface Props {
    analysisInProgress: boolean
    ecTree: DataNodeLike
    taxaTree: NcbiTree

    goCountTableProcessor: GoCountTableProcessor
    goOntology: Ontology<GoCode, GoDefinition>
    ecCountTableProcessor: EcCountTableProcessor
    ecOntology: Ontology<EcCode, EcDefinition>
    interproCountTableProcessor: InterproCountTableProcessor
    interproOntology: Ontology<InterproCode, InterproDefinition>
    ncbiCountTableProcessor: LcaCountTableProcessor
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>
    ncbiTree: NcbiTree
}

defineProps<Props>();

const currentTab = ref<number>(0);

const treeview = ref<HTMLElement | null>(null);
const sunburst = ref<HTMLElement | null>(null);
const treemap  = ref<HTMLElement | null>(null);

const { isFullscreen, toggle } = useFullscreen();

const treeviewReset = ref<boolean>(false);
const sunburstReset = ref<boolean>(false);
const treemapReset  = ref<boolean>(false);

//const treemapFullscreen = ref<boolean>(false);

const downloadSunburstModalOpen = ref<boolean>(false);
const downloadTreemapModalOpen = ref<boolean>(false);
const downloadTreeviewModalOpen = ref<boolean>(false);

// @ts-ignore
const sunburstElement = () => new SvgImageSource(sunburst.value?.$el.querySelector(".visualization-container").children[1]);
// @ts-ignore
const treemapElement = () => new DomImageSource(treemap.value?.$el.querySelector(".treemap"));
// @ts-ignore
const treeviewElement = () => new SvgImageSource(treeview.value?.$el.querySelector("svg"));
</script>

<style scoped>
.fixed-height {
    height: 500px;
}
</style>
