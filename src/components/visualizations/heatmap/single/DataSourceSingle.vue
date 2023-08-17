<template>
    <div>
        <v-select
            v-model="selectedDataSource"
            :items="dataSources"
            label="test"
            class="flex-grow-0"
        />

        <data-source-table
            :items="selectedDataSourceItems"
            :categories="categories"
            :loading="loading"
            :identifier="selectedDataSource !== 'NCBI taxonomy'"
            @select="$emit('select', $event)"
        />
    </div>
</template>

<script setup lang="ts">
import DataSourceSingleItem from './DataSourceSingleItem';
import DataSourceTable from '@/components/tables/DataSourceTable.vue';
import { computed, ref } from 'vue';
import FunctionalDefinition from '@/logic/ontology/functional/FunctionalDefinition';
import { LcaCountTableProcessor, Ontology, NcbiId, NcbiTaxon, NcbiRank, NcbiTree, EcCountTableProcessor, EcCode, EcDefinition, EcNamespace, GoCode, GoCountTableProcessor, GoDefinition, InterproCode, InterproCountTableProcessor, InterproDefinition, GoNamespace, InterproNamespace } from '@/logic';

export interface Props {
    loading: boolean

    goCountTableProcessor: GoCountTableProcessor
    goOntology: Ontology<GoCode, GoDefinition>
    ecCountTableProcessor: EcCountTableProcessor
    ecOntology: Ontology<EcCode, EcDefinition>
    interproCountTableProcessor: InterproCountTableProcessor
    interproOntology: Ontology<InterproCode, InterproDefinition>
    ncbiCountTableProcessor: LcaCountTableProcessor
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>
    ncbiTree: NcbiTree
}

const props = defineProps<Props>();

defineEmits(['select']);

const dataSources: string[] = [
    "NCBI taxonomy",
    "Gene Ontology",
    "Enzyme Commission",
    "Interpro"
];

const selectedDataSource = ref<string>("NCBI taxonomy");
const selectedDataSourceItems = computed(() => {
    if (selectedDataSource.value === "NCBI taxonomy") {
        return ncbiItems.value;
    } else if (selectedDataSource.value === "Enzyme Commission") {
        return ecItems.value;
    } else if (selectedDataSource.value === "Gene Ontology") {
        return goItems.value;
    } else if (selectedDataSource.value === "Interpro") {
        return interproItems.value;
    } else {
        return [];
    }
});

const categories = computed(() => {
    if (selectedDataSource.value === "NCBI taxonomy") {
        return ["All", ...Object.values(NcbiRank)];
    } else if (selectedDataSource.value === "Enzyme Commission") {
        return ["All", ...Object.values(EcNamespace)];
    } else if (selectedDataSource.value === "Gene Ontology") {
        return ["All", ...Object.values(GoNamespace)];
    } else if (selectedDataSource.value === "Interpro") {
        return ["All", ...Object.values(InterproNamespace)];
    } else {
        return [];
    }
});

const ncbiItems = computed(() => computeItems(props.ncbiCountTableProcessor, props.ncbiOntology));
const goItems = computed(() => computeItems(props.goCountTableProcessor, props.goOntology));
const ecItems = computed(() => computeItems(props.ecCountTableProcessor, props.ecOntology));
const interproItems = computed(() => computeItems(props.interproCountTableProcessor, props.interproOntology));

const computeItems = (
    countProcessor: any,
    ontology: any
): DataSourceSingleItem[] => {
    if(props.loading) {
        return [];
    }

    const countTable = countProcessor.getCountTable();
    const peptideMap = countProcessor.getAnnotationPeptideMapping();

    const items: DataSourceSingleItem[] = [];
    for(const id of countTable.getOntologyIds()) {
        const definition = ontology.getDefinition(id);

        if(!definition) {
            continue;
        }

        let category: string = "";
        let count: number = 0;

        if("rank" in definition) {
            category = definition["rank"];
            count = props.ncbiTree.nodes.get(id)?.count || 0;
        } else {
            category = (definition as unknown as FunctionalDefinition).namespace;
            count = countTable.getCounts(id);
        }

        items.push({
            id: id,
            name: definition.name,
            count: count,
            category: category,
            peptides: peptideMap.get(id)
        });
    }

    items.sort((a: DataSourceSingleItem, b: DataSourceSingleItem) => b.count - a.count);

    return items;
}
</script>
