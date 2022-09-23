<template>
    <v-card flat>
        <v-card-text>
            This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein sequence contains the tryptic peptide.

            <TreeViewControls
                class="mt-3"
                :loading="assay.analysisInProgress"
                :fullscreen="() => { }" 
                :reset="() => { }"
            >
                <template #treeview>
                    <TreeView 
                        :data="assay?.taxaTree?.getRoot()"
                        :loading="assay.analysisInProgress"
                        :width="800"
                        :height="500"
                        :autoResize="true"
                        :colors="colors"
                    />
                </template>
            </TreeViewControls>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { SinglePeptideAnalysisStatus } from '@/interface';
import d3 from 'd3';
import TreeviewNode from 'unipept-visualizations/types/visualizations/treeview/TreeviewNode';
import TreeView from '../visualizations/TreeView.vue';
import TreeViewControls from '../visualizations/TreeViewControls.vue';
    
export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const colors = (d: TreeviewNode) => {
    if (d.name === "Bacteria") return "#1565C0"; // blue
    if (d.name === "Archaea") return "#FF8F00"; // orange
    if (d.name === "Eukaryota") return "#2E7D32"; // green
    if (d.name === "Viruses") return "#C62828"; // red

    return d3.scaleOrdinal(d3.schemeCategory10).call(this, d as any);
};
</script>
