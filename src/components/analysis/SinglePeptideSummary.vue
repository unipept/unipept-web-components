<template>
    <div v-if="true">
        <div class="display-1">Tryptic peptide analysis of {{ peptide }}</div>
        <div class="subtitle-1">
            {{ peptide }} was found in
<!--            <span class="font-weight-bold">{{ proteins.length }}</span>                             -->
<!--            UniProt entries with a lowest common ancestor of                                        -->
<!--            <span class="font-weight-bold" v-if="lca">{{ lca.name }}</span>                         -->
        </div>
        <div class="subtitle-2">
            <span v-if="equateIL">Equate I/L is enabled.</span>
            <span v-else>Equate I/L is disabled.</span>
        </div>
    </div>
    <div v-else>
        <div class="display-1">Tryptic peptide analysis of {{ peptide }}</div>
        <span class="subtitle-1">Computing summary...</span>
    </div>
</template>

<script setup lang="ts">
import { AnalysisStatus } from './interface';

export interface Props {
    peptide: string
    equateIL: boolean
    
    //status: AnalysisStatus
}

defineProps<Props>();
</script>
