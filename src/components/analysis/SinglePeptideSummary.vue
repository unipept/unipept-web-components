<template>
    <div v-if="!props.status.analysisInProgress">
        <div class="display-1">Tryptic peptide analysis of {{ props.status.peptide }}</div>
        
        <div class="subtitle-2">
            <span v-if="props.status.equateIl">Equate I/L is enabled.</span>
            <span v-else>Equate I/L is disabled.</span>
        </div>
    </div>
    <div v-else>
        <div class="display-1">Tryptic peptide analysis of {{ props.status.peptide }}</div>
        <span class="subtitle-1">Computing summary...</span>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { SinglePeptideAnalysisStatus } from '@/interface'

export interface Props {
    status: SinglePeptideAnalysisStatus
}

const props = defineProps<Props>();

//console.log(props);

// const proteins = props.proteinProcessor.getProteins();
// 
// const lca = props.proteinProcessor.getLca();
// const lcaDefinition = props.ncbiOntology.getDefinition(props.proteinProcessor.getLca()!);
</script>
