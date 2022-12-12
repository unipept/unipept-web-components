<template>
    <v-card flat>
        <v-card-text>
            <TrustLine
                class="mb-5"
                :trust="goProcessor?.getTrust()"
                :faKind="{
                    singular: 'GO term',
                    plural: 'GO terms'
                }"
                :countKind="{
                    singular: 'protein',
                    plural: 'proteins'
                }"
            />

            <h2 class="py-2">Biological Process</h2>
            <v-row>
                <v-col cols=9>
                    <GoTable 
                        :items="biologicalProcessItems"
                        :loading="analysisInProgress" 
                        :showPercentage="showPercentage"
                        :downloadItem="downloadItem"
                    />
                </v-col>
                <v-col cols=3>
                    <QuickGoCard 
                        :items="biologicalProcessItems"
                        :namespace="GoNamespace.BiologicalProcess"
                        :n="3"
                    />
                </v-col>
            </v-row>

            <h2 class="py-2">Cellular Component</h2>
            <v-row>
                <v-col cols=9>
                    <GoTable 
                        :items="cellularComponentItems"
                        :loading="analysisInProgress" 
                        :showPercentage="showPercentage"
                        :downloadItem="downloadItem"
                    />
                </v-col>
                <v-col cols=3>
                    <QuickGoCard 
                        :items="cellularComponentItems" 
                        :namespace="GoNamespace.CellularComponent"
                        :n="3"
                    />
                </v-col>
            </v-row>

            <h2 class="py-2">Molecular Function</h2>
            <v-row>
                <v-col cols=9>
                    <GoTable 
                        :items="molecularFunctionItems"
                        :loading="analysisInProgress" 
                        :showPercentage="showPercentage"
                        :downloadItem="downloadItem"
                    />
                </v-col>
                <v-col cols=3>
                    <QuickGoCard 
                        :items="molecularFunctionItems" 
                        :namespace="GoNamespace.MolecularFunction"
                        :n="3"
                    />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { FunctionalCountTableProcessor, GoCode, GoDefinition, GoNamespace, Ontology } from '@/logic';
import GoTableItem from '@/components/tables/functional/GoTableItem';
import GoTable from '@/components/tables/functional/GoTable.vue';
import QuickGoCard from './QuickGoCard.vue';
import TrustLine from '@/components/util/TrustLine.vue';
import { computed } from 'vue';

export interface Props {
    analysisInProgress: boolean
    showPercentage: boolean
    
    goProcessor: FunctionalCountTableProcessor<GoCode, GoDefinition>
    goOntology: Ontology<GoCode, GoDefinition>

    downloadItem?: (code: GoCode) => Promise<void>
}

const props = defineProps<Props>();

const biologicalProcessItems = computed(() => {
    if(!props.analysisInProgress) {
        return items(props.goProcessor, props.goOntology, GoNamespace.BiologicalProcess);
    }

    return [];
});

const cellularComponentItems = computed(() => {
    if(!props.analysisInProgress) {
        return items(props.goProcessor, props.goOntology, GoNamespace.CellularComponent);
    }

    return [];
});

const molecularFunctionItems = computed(() => {
    if(!props.analysisInProgress) {
        return items(props.goProcessor, props.goOntology, GoNamespace.MolecularFunction);
    }

    return [];
});

const items = (
    goProcessor: FunctionalCountTableProcessor<GoCode, GoDefinition>, 
    goOntology: Ontology<GoCode, GoDefinition>,
    namespace: GoNamespace
) => {
    const countTable = goProcessor.getCountTable(namespace);

    const items: GoTableItem[] = [];
    countTable.toMap().forEach((count, code) => {
        const definition = goOntology.getDefinition(code) || { 
            name: "", 
            code: code
        };

        items.push({
            name: definition.name,
            namespace: namespace,
            code: definition.code,
            count: count,
            relativeCount: count / goProcessor.getTrust().totalAmountOfItems
        });
    });

    return items;
}
</script>
