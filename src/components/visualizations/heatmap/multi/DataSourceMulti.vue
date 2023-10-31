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
import { computed, ref } from 'vue';
import FunctionalDefinition from '@/logic/ontology/functional/FunctionalDefinition';
import { Ontology, NcbiTaxon, NcbiRank, EcNamespace, GoNamespace, InterproNamespace, ProteomicsCountTableProcessor, OntologyType, Definition } from '@/logic';
import DataSourceMultiTable from './DataSourceMultiTable.vue';
import MultiProteomicsAnalysisStatus from '@/interface/MultiProteomicsAnalysisStatus';
import DataSourceMultiItem from './DataSourceMultiItem';
import DataSourceTable from "@/components/tables/DataSourceTable.vue";

export interface Props {
    loading: boolean

    assays: MultiProteomicsAnalysisStatus[]
}

const props = defineProps<Props>();

defineEmits(['select']);

type SourceMetadata = {
    items: DataSourceMultiItem[],
    tableProcessor: (a: MultiProteomicsAnalysisStatus) => ProteomicsCountTableProcessor<OntologyType>,
    ontology: (a: MultiProteomicsAnalysisStatus) => Ontology<OntologyType, Definition>,
    loading: boolean,
    categories: string[],
    // What's the title of the category column that should be shown in the data table?
    categoryTitle: string,
    // Should the identifier be shown in the data source table instead of the category name?
    showIdentifier: boolean
};

const dataSources: string[] = [
    "NCBI taxonomy",
    "Gene Ontology",
    "Enzyme Commission",
    "Interpro"
];

const sourceMetadata: SourceMetadata[] = [
    {
        items: [],
        loading: true,
        tableProcessor: (a: MultiProteomicsAnalysisStatus) => a.data.lcaCountTableProcessor,
        ontology: (a: MultiProteomicsAnalysisStatus) => a.ncbiOntology,
        categories: Object.values(NcbiRank),
        showIdentifier: false,
        categoryTitle: "Rank"
    },
    {
        items: [],
        loading: true,
        tableProcessor: (a: MultiProteomicsAnalysisStatus) => a.data.goCountTableProcessor,
        ontology: (a: MultiProteomicsAnalysisStatus) => a.goOntology,
        categories: Object.values(GoNamespace),
        showIdentifier: true,
        categoryTitle: "Namespace"
    },
    {
        items: [],
        loading: true,
        tableProcessor: (a: MultiProteomicsAnalysisStatus) => a.data.ecCountTableProcessor,
        ontology: (a: MultiProteomicsAnalysisStatus) => a.ecOntology,
        categories: Object.values(EcNamespace),
        showIdentifier: true,
        categoryTitle: "Namespace"
    },
    {
        items: [],
        loading: true,
        tableProcessor: (a: MultiProteomicsAnalysisStatus) => a.data.interproCountTableProcessor,
        ontology: (a: MultiProteomicsAnalysisStatus) => a.interproOntology,
        categories: Object.values(InterproNamespace),
        showIdentifier: true,
        categoryTitle: "Namespace"
    }
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

const ncbiItems = computed(() => computeItems(sourceMetadata[0]));
const goItems = computed(() => computeItems(sourceMetadata[1]));
const ecItems = computed(() => computeItems(sourceMetadata[2]));
const interproItems = computed(() => computeItems(sourceMetadata[3]));

const computeItems = (
    dataItem: SourceMetadata
): DataSourceMultiItem[] => {
    if(props.loading) {
        return [];
    }

    // Maps an annotation onto a tuple that keeps track of the counts. Every ontology id is mapped onto a new
    // map that keeps track of the amount of peptides associated with this annotation per assay id.
    const definitionCountMap = new Map<OntologyType, Map<string, number>>();
    const ontologyMap = new Map<OntologyType, Definition>();

    for (const assay of props.assays) {
        const countTable = dataItem.tableProcessor(assay).getCountTable();
        for (const ontologyId of countTable.getOntologyIds()) {
            if (!definitionCountMap.has(ontologyId)) {
                definitionCountMap.set(ontologyId, new Map());
            }
            definitionCountMap.get(ontologyId)?.set(assay.assay.id, countTable.getCounts(ontologyId));
        }
        dataItem.ontology(assay).toMap().forEach((val, key) => ontologyMap.set(key, val));
    }

    const ontology: Ontology<OntologyType, Definition> = new Ontology(ontologyMap);

    const items: DataSourceMultiItem[] = [];
    for(const [ontologyId, countMap] of definitionCountMap) {
        const definition = ontology.getDefinition(ontologyId);

        if (!definition) {
            continue;
        }

        let category: string = "";

        if (Object.prototype.hasOwnProperty.call(definition, "rank")) {
            category = (definition as NcbiTaxon).rank;
        } else {
            category = (definition as FunctionalDefinition).namespace;
        }

        items.push({
            // @ts-ignore (should be fixed in the future)
            name: definition.name,
            id: ontologyId,
            count: Array.from(countMap.values()).reduce((acc, current) => acc + current, 0),
            category: category,
            assayCount: countMap.size,
            assayCounts: countMap
        });
    }

    items.sort((a: DataSourceMultiItem, b: DataSourceMultiItem) => b.count - a.count);

    return items;
}
</script>
