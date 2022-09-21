<template>
    <v-card flat>
        <v-card-text>
            <!-- <span v-html="trustLine" class="go-trust"></span> -->
            <InterproTable 
                :items="assay.analysisInProgress ? [] : items(assay)"
                :loading="assay.analysisInProgress" 
                :showPercentage="false" 
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { SinglePeptideAnalysisStatus } from '@/interface';
import { InterproNamespace } from '@/logic';
import InterproTable from '../tables/InterproTable.vue';
import { InterproTableItem } from '../tables';

export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const items = (assay: SinglePeptideAnalysisStatus) => {
    const countTable = assay.interproProteinCountTableProcessor.getCountTable();

    const items: InterproTableItem[] = [];
    countTable.toMap().forEach((count, code) => {
        const definition = assay.interproOntology.getDefinition(code) || { 
            name: "", 
            code: code,
            namespace: InterproNamespace.Unknown 
        };

        items.push({
            name: definition.name,
            code: definition.code,
            namespace: definition.namespace,
            count: count,
            relativeCount: count / assay.interproProteinCountTableProcessor.getTrust().totalAmountOfItems
        });
    });

    return items;
}
</script>
