<template>
    <v-card flat>
        <v-card-text>
            This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein sequence contains the tryptic peptide.

            <TreeViewControls
                ref="treeView"
                class="mt-3"
                :loading="assay.analysisInProgress"
                :fullscreen="() => toggle(treeView)" 
                :download="downloadSvg"
                :reset="() => { }"
            >
                <template #treeview>
                    <TreeView 
                        :data="assay?.taxaTree?.getRoot()"
                        :loading="assay.analysisInProgress"
                        :autoResize="true"
                        :colors="colors"
                    />
                </template>
            </TreeViewControls>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import useFullscreen from '@/composables/useFullscreen';
import useSvgDownload from '@/composables/useSvgDownload';
import { SinglePeptideAnalysisStatus } from '@/interface';
import d3 from 'd3';
import TreeviewNode from 'unipept-visualizations/types/visualizations/treeview/TreeviewNode';
import { ref } from 'vue';
import TreeView from '../visualizations/TreeView.vue';
import TreeViewControls from '../visualizations/TreeViewControls.vue';
    
export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const treeView = ref<HTMLElement | null>(null);

const { toggle } = useFullscreen();
const { download } = useSvgDownload();

const downloadSvg = () => {
    // @ts-ignore
    const svg = treeView.value?.$el.querySelector("svg");
    download(svg, "LineageTree.svg");
}

const colors = (d: TreeviewNode) => {
    if (d.name === "Bacteria") return "#1565C0"; // blue
    if (d.name === "Archaea") return "#FF8F00"; // orange
    if (d.name === "Eukaryota") return "#2E7D32"; // green
    if (d.name === "Viruses") return "#C62828"; // red

    return d3.scaleOrdinal(d3.schemeCategory10).call(this, d as any);
};
</script>
