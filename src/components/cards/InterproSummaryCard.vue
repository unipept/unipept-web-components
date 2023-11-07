<template>
    <v-card flat>
        <v-card-text>
            <v-row v-if="!analysisInProgress">
                <v-col>
                    <trust-line
                        v-if="interproProcessor"
                        class="mb-5"
                        :trust="interproProcessor.getTrust()"
                        :fa-kind="{
                            singular: 'InterPro entry',
                            plural: 'InterPro entries'
                        }"
                        :count-kind="{
                            singular: 'protein',
                            plural: 'proteins'
                        }"
                        :clickable="ncbiTree !== undefined"
                    />
                </v-col>
                <v-col
                    v-if="filter"
                    class="flex-grow-0"
                >
                    <v-btn
                        icon="mdi-cog-outline"
                        size="small"
                        variant="text"
                        @click="editFilterPercentageModalOpen = true"
                    />
                </v-col>
            </v-row>

            <interpro-table
                :items="items"
                :loading="analysisInProgress"
                :show-percentage="showPercentage"
                :download-item="downloadItem"
                :ncbi-tree="ncbiTree"
                :taxa-to-peptides="(ncbiProcessor && ncbiTree) ? ncbiProcessor!.getAnnotationPeptideMapping() : undefined"
                :item-to-peptides="(interproProcessor && ncbiTree) ? interproProcessor.getAnnotationPeptideMapping() : undefined"
            />

            <edit-filter-percentage-modal
                :model-value="filterPercentage"
                :open-modal="editFilterPercentageModalOpen"
                @close="editFilterPercentageModalOpen = false"
                @update:model-value="onUpdateFilterPercentage"
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { FunctionalCountTableProcessor, InterproCode, InterproDefinition, InterproNamespace, LcaCountTableProcessor, NcbiTree, Ontology } from '@/logic';
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

    ncbiProcessor?: LcaCountTableProcessor
    ncbiTree?: NcbiTree

    downloadItem?: (code: InterproCode) => Promise<void>
}

const props = defineProps<Props>();

const emits = defineEmits(["filterPercentageChange"])

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
    emits("filterPercentageChange", newFilterPercentage);
};

watch(() => props.filter, (newFilter) => {
    onUpdateFilterPercentage(newFilter)
});
</script>
