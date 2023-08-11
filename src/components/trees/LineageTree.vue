<template>
    <v-card flat>
        <v-card-text>
            This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein sequence
            contains the tryptic peptide.

            <VisualizationControls
                ref="treeview"
                class="mt-3"
                caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
                :loading="assay.analysisInProgress"
                :fullscreen="() => toggle(treeview)"
                :download="() => downloadTreeviewModalOpen = true"
                :reset="() => reset = true"
                :hide-download="isFullscreen"
            >
                <template #visualization>
                    <TreeView
                        :data="assay?.taxaTree?.getRoot()"
                        :loading="assay.analysisInProgress"
                        :width="800"
                        :height="500"
                        :auto-resize="true"
                        :colors="colors"
                        :do-reset="reset"
                        @reset="reset = false"
                    />
                </template>
            </VisualizationControls>

            <DownloadImageModal
                :open-modal="downloadTreeviewModalOpen"
                :image-source="treeviewElement()"
                supports-svg
                @close="downloadTreeviewModalOpen = false"
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import useFullscreen from '@/composables/useFullscreen';
import { SinglePeptideAnalysisStatus } from '@/interface';
import SvgImageSource from '@/logic/util/image/SvgImageSource';
import d3 from 'd3';
import TreeviewNode from 'unipept-visualizations/types/visualizations/treeview/TreeviewNode';
import { ref } from 'vue';
import DownloadImageModal from '../modals/DownloadImageModal.vue';
import TreeView from '../visualizations/TreeView.vue';
import VisualizationControls from '../visualizations/VisualizationControls.vue';

export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const treeview = ref<HTMLElement | null>(null);

const { isFullscreen, toggle } = useFullscreen();

const reset = ref<boolean>(false);

const downloadTreeviewModalOpen = ref<boolean>(false);

const colors = (d: TreeviewNode) => {
    if (d.name === "Bacteria") return "#1565C0"; // blue
    if (d.name === "Archaea") return "#FF8F00"; // orange
    if (d.name === "Eukaryota") return "#2E7D32"; // green
    if (d.name === "Viruses") return "#C62828"; // red

    return d3.scaleOrdinal(d3.schemeCategory10).call(this, d as any);
};

// @ts-ignore (We know that the SVG-element will always be there)
const treeviewElement = () => new SvgImageSource(treeview.value?.$el.querySelector("svg"));
</script>
