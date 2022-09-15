<template>
    <div v-if="!assay.analysisInProgress">
        <div class="display-1">Tryptic peptide analysis of {{ assay.peptide }}</div>
        <div class="subtitle-1">
            {{ assay.peptide }} was found in
            <span class="font-weight-bold">{{ proteins(assay).length }}</span>
            UniProt entries with a lowest common ancestor of 
            <span class="font-weight-bold">{{ lca(assay)?.name }}</span>
        </div>
        <div class="subtitle-2">
            <span v-if="assay.equateIl">Equate I/L is enabled.</span>
            <span v-else>Equate I/L is disabled.</span>
        </div>
    </div>
    <div v-else>
        <div class="display-1">Tryptic peptide analysis of {{ assay.peptide }}</div>
        <span class="subtitle-1">Computing summary...</span>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { SinglePeptideAnalysisStatus } from '@/interface'
import { NcbiTaxon, ProteinDefinition } from '@/logic';

export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const proteins = (assay: SinglePeptideAnalysisStatus): ProteinDefinition[] => {
    return assay.proteinProcessor.getProteins();
};

const lca = (assay: SinglePeptideAnalysisStatus): (NcbiTaxon | undefined) => {
    console.log(assay);
    return assay.ncbiOntology.getDefinition(assay.proteinProcessor.getLca());
};
</script>
