<template>
    <v-card flat>
        <v-card-text>
            <TrustLine
                class="mb-5"
                :trust="interproProcessor?.getTrust()"
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
                :items="items"
                :loading="analysisInProgress" 
                :showPercentage="showPercentage"
                :downloadItem="downloadItem"
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { FunctionalCountTableProcessor, InterproCode, InterproDefinition, InterproNamespace, Ontology } from '@/logic';
import InterproTableItem from '../tables/functional/InterproTableItem';
import InterproTable from '../tables/functional/InterproTable.vue';
import TrustLine from '../util/TrustLine.vue';
import { computed } from 'vue';

export interface Props {
    analysisInProgress: boolean
    showPercentage: boolean
    
    interproProcessor: FunctionalCountTableProcessor<InterproCode, InterproDefinition>
    interproOntology: Ontology<InterproCode, InterproDefinition>

    downloadItem?: (code: InterproCode) => Promise<void>
}

const props = defineProps<Props>();

const items = computed(() => {
    if(!props.analysisInProgress) {
        const countTable = props.interproProcessor.getCountTable();

        const items: InterproTableItem[] = [];
        countTable.toMap().forEach((count, code) => {
            const definition = props.interproOntology.getDefinition(code) || { 
                name: "", 
                code: code,
                namespace: InterproNamespace.Unknown 
            };

            items.push({
                name: definition.name,
                code: definition.code,
                namespace: definition.namespace,
                count: count,
                relativeCount: count / props.interproProcessor.getTrust().totalAmountOfItems
            });
        });

        return items;
    }

    return [];
});
</script>
