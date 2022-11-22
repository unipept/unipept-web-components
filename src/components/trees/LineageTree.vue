<template>
    <v-card flat>
        <v-card-text>
            This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein sequence contains the tryptic peptide.

            <TreeViewControls
                ref="treeview"
                class="mt-3"
                :loading="assay.analysisInProgress"
                :fullscreen="() => toggle(treeview)" 
                :download="() => downloadTreeviewModalOpen = true"
                :reset="() => reset = true"
            >
                <template #treeview>
                    <TreeView
                        :data="assay?.taxaTree?.getRoot()"
                        :loading="assay.analysisInProgress"
                        :width="800"
                        :height="500"
                        :autoResize="true"
                        :colors="colors"
                        :doReset="reset"
                        @reset="reset = false"
                    />
                </template>
            </TreeViewControls>

            <DownloadImageModal 
                :openModal="downloadTreeviewModalOpen"
                :imageSource="treeviewElement()"
                @close="downloadTreeviewModalOpen = false"
                supportsSvg
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import useFullscreen from '@/composables/useFullscreen';
import useSvgDownload from '@/composables/useSvgDownload';
import { SinglePeptideAnalysisStatus } from '@/interface';
import SvgImageSource from '@/logic/util/image/SvgImageSource';
import d3 from 'd3';
import TreeviewNode from 'unipept-visualizations/types/visualizations/treeview/TreeviewNode';
import { ref } from 'vue';
import { VCard, VCardText } from 'vuetify/lib';
import DownloadImageModal from '../modals/DownloadImageModal.vue';
import TreeView from '../visualizations/TreeView.vue';
import TreeViewControls from '../visualizations/TreeViewControls.vue';
    
export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const treeview = ref<HTMLElement | null>(null);

const { toggle } = useFullscreen();

const reset = ref<boolean>(false);

const downloadTreeviewModalOpen = ref<boolean>(false);

const colors = (d: TreeviewNode) => {
    if (d.name === "Bacteria") return "#1565C0"; // blue
    if (d.name === "Archaea") return "#FF8F00"; // orange
    if (d.name === "Eukaryota") return "#2E7D32"; // green
    if (d.name === "Viruses") return "#C62828"; // red

    return d3.scaleOrdinal(d3.schemeCategory10).call(this, d as any);
};

// @ts-ignore
const treeviewElement = () => new SvgImageSource(treeview.value?.$el.querySelector("svg"));
</script>
