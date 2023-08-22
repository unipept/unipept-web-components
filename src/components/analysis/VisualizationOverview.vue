<template>
    <v-card>
        <v-tabs
            v-model="currentTab"
            slider-color="secondary"
            bg-color="primary"
            dark
        >
            <v-tab value="sunburst">
                Sunburst
            </v-tab>
            <v-tab value="treemap">
                Treemap
            </v-tab>
            <v-tab value="treeview">
                Treeview
            </v-tab>
            <v-tab value="hierarchical">
                Hierarchical outline
            </v-tab>
            <v-tab value="heatmap">
                Heatmap
            </v-tab>
        </v-tabs>

        <v-window
            v-model="currentTab"
            class="mb-5"
        >
            <v-window-item
                value="sunburst"
                class="fixed-height"
            >
                <VisualizationControls
                    ref="sunburst"
                    caption="Click a slice to zoom in and the center node to zoom out"
                    :loading="analysisInProgress"
                    :fullscreen="() => toggle(sunburst)"
                    :download="() => downloadSunburstModalOpen = true"
                    :reset="() => sunburstReset = true"
                    :hide-download="isFullscreen"
                    settings
                >
                    <template #settings>
                        <v-list-item title="Use fixed colors">
                            <v-list-item-action>
                                <v-checkbox
                                    v-model="isFixedColors"
                                    color="primary"
                                />
                            </v-list-item-action>
                        </v-list-item>
                    </template>
                    <template #visualization>
                        <Sunburst
                            :data="ncbiTree"
                            :loading="analysisInProgress"
                            :auto-resize="true"
                            :height="600"
                            :do-reset="sunburstReset"
                            :is-fixed-colors="isFixedColors"
                            :filter-id="filterId"
                            @reset="sunburstReset = false"
                            @update-selected-taxon-id="updateSelectedTaxonId"
                        />
                    </template>
                </VisualizationControls>
            </v-window-item>
            <v-window-item
                value="treemap"
                class="fixed-height"
            >
                <visualization-controls
                    ref="treemap"
                    caption="Click a square to zoom in and right click to zoom out"
                    :loading="analysisInProgress"
                    :overlap="false"
                    :fullscreen="() => toggle(treemap)"
                    :download="() => downloadTreemapModalOpen = true"
                    :reset="() => treemapReset = true"
                    :hide-download="isFullscreen"
                >
                    <template #visualization>
                        <TreeMap
                            :data="ncbiTree"
                            :loading="analysisInProgress || !ncbiTree"
                            :height="460"
                            :auto-resize="true"
                            :do-reset="treemapReset"
                            :fullscreen="isFullscreen && currentTab === 'sunburst'"
                            :filter-id="filterId"
                            @reset="treemapReset = false"
                            @update-selected-taxon-id="updateSelectedTaxonId"
                        />
                    </template>
                </visualization-controls>
            </v-window-item>
            <v-window-item
                value="treeview"
                class="fixed-height"
            >
                <visualization-controls
                    ref="treeview"
                    caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
                    :loading="analysisInProgress"
                    :fullscreen="() => toggle(treeview)"
                    :download="() => downloadTreeviewModalOpen = true"
                    :reset="() => treeviewReset = true"
                    :hide-download="isFullscreen"
                >
                    <template #visualization>
                        <tree-view
                            :data="ncbiTree?.getRoot()"
                            :loading="analysisInProgress || !ncbiTree"
                            :auto-resize="true"
                            :height="500"
                            :do-reset="treeviewReset"
                            @reset="treeviewReset = false"
                        />
                    </template>
                </visualization-controls>
            </v-window-item>
            <v-window-item
                value="hierarchical"
                class="pa-5"
            >
                <hierarchical-outline
                    :tree="ncbiTree"
                    :equate-il="true"
                    :loading="analysisInProgress"
                />
            </v-window-item>
            <v-window-item value="heatmap">
                <heatmap-wizard-single
                    :loading="analysisInProgress"
                    :go-count-table-processor="goCountTableProcessor"
                    :go-ontology="goOntology"
                    :ec-count-table-processor="ecCountTableProcessor"
                    :ec-ontology="ecOntology"
                    :interpro-count-table-processor="interproCountTableProcessor"
                    :interpro-ontology="interproOntology"
                    :ncbi-count-table-processor="ncbiCountTableProcessor"
                    :ncbi-ontology="ncbiOntology"
                    :ncbi-tree="ncbiTree"
                />
            </v-window-item>
        </v-window>

        <download-image-modal
            :open-modal="downloadSunburstModalOpen"
            :image-source="sunburstElement()"
            supports-svg
            @close="downloadSunburstModalOpen = false"
        />

        <download-image-modal
            :open-modal="downloadTreemapModalOpen"
            :image-source="treemapElement()"
            @close="downloadTreemapModalOpen = false"
        />

        <download-image-modal
            :open-modal="downloadTreeviewModalOpen"
            :image-source="treeviewElement()"
            supports-svg
            @close="downloadTreeviewModalOpen = false"
        />
    </v-card>
</template>

<script setup lang="ts">
import useFullscreen from '@/composables/useFullscreen';
import { DataNodeLike } from 'unipept-visualizations/types';
import { ref } from 'vue';
import VisualizationControls from '../visualizations/VisualizationControls.vue';
import TreeView from '../visualizations/TreeView.vue';
import { EcCode, EcCountTableProcessor, EcDefinition, GoCode, GoCountTableProcessor, GoDefinition, InterproCode, InterproCountTableProcessor, InterproDefinition, LcaCountTableProcessor, NcbiId, NcbiTaxon, NcbiTree, Ontology } from '@/logic';
import TreeMap from '../visualizations/TreeMap.vue';
import HeatmapWizardSingle from '../visualizations/heatmap/single/HeatmapWizardSingle.vue';
import DownloadImageModal from '../modals/DownloadImageModal.vue';
import DomImageSource from '@/logic/util/image/DomImageSource';
import SvgImageSource from '@/logic/util/image/SvgImageSource';
import HierarchicalOutline from '../visualizations/HierarchicalOutline.vue';

export interface Props {
    analysisInProgress: boolean

    goCountTableProcessor: GoCountTableProcessor
    goOntology: Ontology<GoCode, GoDefinition>
    ecCountTableProcessor: EcCountTableProcessor
    ecOntology: Ontology<EcCode, EcDefinition>
    interproCountTableProcessor: InterproCountTableProcessor
    interproOntology: Ontology<InterproCode, InterproDefinition>
    ncbiCountTableProcessor: LcaCountTableProcessor
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>
    ncbiTree: NcbiTree
    ecTree: DataNodeLike

    filterId: number
}

defineProps<Props>();

const emits = defineEmits(['update-selected-taxon-id']);

const currentTab = ref<string>("sunburst");
const isFixedColors = ref<boolean>(false);

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

const updateSelectedTaxonId = (id: number) => {
    emits('update-selected-taxon-id', id);
};
</script>

<style scoped>
.fixed-height {
    height: 500px;
}
</style>
