<template>
    <v-card flat>
        <v-card-text>
            <TrustLine
                :trust="assay.interproProteinCountTableProcessor?.getTrust()"
                :faKind="{
                    singular: 'InterPro entry',
                    plural: 'InterPro entries'
                }"
                :countKind="{
                    singular: 'protein',
                    plural: 'proteins'
                }"
            />
            <InterproTable 
                :items="assay.analysisInProgress ? [] : items(assay)"
                :loading="assay.analysisInProgress" 
                :showPercentage="false" 
            />
        </v-card-text>
    </v-card>
</template>

FunctionalUtils.computeTrustLine(this.trust, "InterPro-entry", "protein");


<script setup lang="ts">
import { SinglePeptideAnalysisStatus } from '@/interface';
import { InterproNamespace } from '@/logic';
import InterproTableItem from '../tables/functional/InterproTableItem';
import InterproTable from '../tables/functional/InterproTable.vue';
import TrustLine from '../util/TrustLine.vue';

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
