<template>
    <v-card flat>
        <v-card-text>
            <v-row v-if="!analysisInProgress">
                <v-col>
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
                </v-col>
                <v-col v-if="filter !== undefined" class="flex-grow-0">
                    <v-btn icon @click="editFilterPercentageModalOpen = true">
                        <v-icon color="grey darken-1">mdi-cog-outline</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            
            <InterproTable 
                :items="items"
                :loading="analysisInProgress" 
                :showPercentage="showPercentage"
                :downloadItem="downloadItem"
            />

            <EditFilterPercentageModal
                :model-value="filterPercentage"
                :openModal="editFilterPercentageModalOpen"
                @close="editFilterPercentageModalOpen = false"
                @update:model-value="onUpdateFilterPercentage"
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { FunctionalCountTableProcessor, InterproCode, InterproDefinition, InterproNamespace, Ontology } from '@/logic';
import InterproTableItem from '../tables/functional/InterproTableItem';
import InterproTable from '../tables/functional/InterproTable.vue';
import TrustLine from '../util/TrustLine.vue';
import { computed, ref, watch } from 'vue';
import EditFilterPercentageModal from '../modals/EditFilterPercentageModal.vue';

export interface Props {
    analysisInProgress: boolean
    showPercentage: boolean
    filter: number
    
    interproProcessor: FunctionalCountTableProcessor<InterproCode, InterproDefinition>
    interproOntology: Ontology<InterproCode, InterproDefinition>

    downloadItem?: (code: InterproCode) => Promise<void>
}

const props = defineProps<Props>();

const emits = defineEmits(["filerPercentageChange"])

const editFilterPercentageModalOpen = ref<boolean>(false);
const filterPercentage = ref<number>(props.filter);

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

const onUpdateFilterPercentage = (newFilterPercentage: number) => {
    filterPercentage.value = newFilterPercentage;
    emits("filerPercentageChange", newFilterPercentage);
};

watch(() => props.filter, (newFilter) => {
    onUpdateFilterPercentage(newFilter)
});
</script>
