<template>
    <v-card flat>
        <v-card-text>
            <v-row v-if="!analysisInProgress">
                <v-col>
                    <trust-line
                        class="mb-5"
                        :trust="goProcessor.getTrust()"
                        :fa-kind="{
                            singular: 'GO term',
                            plural: 'GO terms'
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

            <h2 class="py-2">
                Biological Process
            </h2>
            <v-row>
                <v-col cols="9">
                    <GoTable
                        :items="biologicalProcessItems"
                        :loading="analysisInProgress"
                        :show-percentage="showPercentage"
                        :download-item="downloadItem"
                        :ncbi-tree="ncbiTree"
                        :taxa-to-peptides="(ncbiProcessor && ncbiTree) ? ncbiProcessor!.getAnnotationPeptideMapping() : undefined"
                        :item-to-peptides="(goProcessor && ncbiTree) ? goProcessor.getAnnotationPeptideMapping() : undefined"
                    />
                </v-col>
                <v-col cols="3">
                    <QuickGoCard
                        :items="biologicalProcessItems"
                        :namespace="GoNamespace.BiologicalProcess"
                        :n="3"
                    />
                </v-col>
            </v-row>

            <h2 class="py-2">
                Cellular Component
            </h2>
            <v-row>
                <v-col cols="9">
                    <GoTable
                        :items="cellularComponentItems"
                        :loading="analysisInProgress"
                        :show-percentage="showPercentage"
                        :download-item="downloadItem"
                        :ncbi-tree="ncbiTree"
                        :taxa-to-peptides="(ncbiProcessor && ncbiTree) ? ncbiProcessor!.getAnnotationPeptideMapping() : undefined"
                        :item-to-peptides="(goProcessor && ncbiTree) ? goProcessor.getAnnotationPeptideMapping() : undefined"
                    />
                </v-col>
                <v-col cols="3">
                    <QuickGoCard
                        :items="cellularComponentItems"
                        :namespace="GoNamespace.CellularComponent"
                        :n="3"
                    />
                </v-col>
            </v-row>

            <h2 class="py-2">
                Molecular Function
            </h2>
            <v-row>
                <v-col cols="9">
                    <GoTable
                        :items="molecularFunctionItems"
                        :loading="analysisInProgress"
                        :show-percentage="showPercentage"
                        :download-item="downloadItem"
                        :ncbi-tree="ncbiTree"
                        :taxa-to-peptides="(ncbiProcessor && ncbiTree) ? ncbiProcessor!.getAnnotationPeptideMapping() : undefined"
                        :item-to-peptides="(goProcessor && ncbiTree) ? goProcessor.getAnnotationPeptideMapping() : undefined"
                    />
                </v-col>
                <v-col cols="3">
                    <QuickGoCard
                        :items="molecularFunctionItems"
                        :namespace="GoNamespace.MolecularFunction"
                        :n="3"
                    />
                </v-col>
            </v-row>

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
import { FunctionalCountTableProcessor, GoCode, GoDefinition, GoNamespace, LcaCountTableProcessor, NcbiTree, Ontology } from '@/logic';
import GoTableItem from '@/components/tables/functional/GoTableItem';
import GoTable from '@/components/tables/functional/GoTable.vue';
import QuickGoCard from './QuickGoCard.vue';
import TrustLine from '@/components/util/TrustLine.vue';
import { computed, ref, watch } from 'vue';
import EditFilterPercentageModal from '../modals/EditFilterPercentageModal.vue';

export interface Props {
    analysisInProgress: boolean
    showPercentage: boolean
    filter: number

    goProcessor: FunctionalCountTableProcessor<GoCode, GoDefinition>
    goOntology: Ontology<GoCode, GoDefinition>

    ncbiProcessor?: LcaCountTableProcessor
    ncbiTree?: NcbiTree

    downloadItem?: (code: GoCode) => Promise<void>
}

const props = defineProps<Props>();

const emits = defineEmits(["filterPercentageChange"])

const editFilterPercentageModalOpen = ref<boolean>(false);
const filterPercentage = ref<number>(props.filter);

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
            relativeCount: count / goProcessor.getTrust().totalAmountOfItems,
            totalAnnotations: goProcessor.getTrust().totalAmountOfItems
        });
    });

    return items;
}

const onUpdateFilterPercentage = (newFilterPercentage: number) => {
    filterPercentage.value = newFilterPercentage;
    emits("filterPercentageChange", newFilterPercentage);
};

watch(() => props.filter, (newFilter) => {
    onUpdateFilterPercentage(newFilter)
});
</script>
