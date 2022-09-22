<template>
    <v-card flat>
        <v-card-text>
            <TrustLine
                :trust="assay.ecProteinCountTableProcessor.getTrust()"
                :faKind="{
                    singular: 'EC number',
                    plural: 'EC numbers'
                }"
                :countKind="{
                    singular: 'protein',
                    plural: 'proteins'
                }"
            />
            <EcTable 
                :items="assay.analysisInProgress ? [] : items(assay)"
                :loading="assay.analysisInProgress" 
                :showPercentage="false" 
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { SinglePeptideAnalysisStatus } from '@/interface';
import EcTable from '../tables/functional/EcTable.vue';
import EcTableItem from '../tables/functional/EcTableItem';
import TrustLine from '../util/TrustLine.vue';

export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const items = (assay: SinglePeptideAnalysisStatus) => {
    const countTable = assay.ecProteinCountTableProcessor.getCountTable();

    const items: EcTableItem[] = [];
    countTable.toMap().forEach((count, code) => {
        const definition = assay.ecOntology.getDefinition(code) || { 
            name: "", 
            code: code
        };

        items.push({
            name: definition.name,
            code: definition.code,
            count: count,
            relativeCount: count / assay.ecProteinCountTableProcessor.getTrust().totalAmountOfItems
        });
    });

    return items;
}
</script>
