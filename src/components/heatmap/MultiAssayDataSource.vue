<docs>
    This component is designed to display information about taxonomic or functional annotations for multiple assays.
    Both the total number of peptides (over multiple assays) that are annotated with a specific annotation and the
    amount of assays in which the annotation occurs are shown (as well as the annotation's name and category or id).
</docs>

<template>
    <div>
        <!-- By passing the datasource model as a prop here, the template in the component filling it in, can
        access and update the v-model -->
        <slot :update-datasource="updateDatasource" :datasource="datasource" :datasources="datasources">
            <p>Please select type of data that should be compared between samples.</p>
            <v-select :items="datasources" v-model="datasource" label="Datasource" class="flex-grow-0"></v-select>
        </slot>
        <data-source
            :items="sourceMetadata[selectedIndex].items"
            :categories="sourceMetadata[selectedIndex].categories"
            :loading="sourceMetadata[selectedIndex].loading"
            :headers="headers"
            v-on:selected-items="onSelectedItems">
        </data-source>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import DataSource from "./DataSource.vue";
import { Prop, Watch } from "vue-property-decorator";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import ProteomicsCountTableProcessor from "./../../business/processors/ProteomicsCountTableProcessor";
import OntologyProcessor from "./../../business/ontology/OntologyProcessor";
import FunctionalDefinition from "./../../business/ontology/functional/FunctionalDefinition";
import NcbiTaxon from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import { OntologyIdType } from "./../../business/ontology/Ontology";
import MultiAssayDataSourceItem from "./MultiAssayDataSourceItem";
import LcaCountTableProcessor from "./../../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import NcbiOntologyProcessor from "./../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import { NcbiRank } from "./../../business/ontology/taxonomic/ncbi/NcbiRank";
import GoCountTableProcessor from "./../../business/processors/functional/go/GoCountTableProcessor";
import GoOntologyProcessor from "./../../business/ontology/functional/go/GoOntologyProcessor";
import { GoNamespace } from "./../../business/ontology/functional/go/GoNamespace";
import EcCountTableProcessor from "./../../business/processors/functional/ec/EcCountTableProcessor";
import EcOntologyProcessor from "./../../business/ontology/functional/ec/EcOntologyProcessor";
import { EcNamespace } from "./../../business/ontology/functional/ec/EcNamespace";
import InterproCountTableProcessor from "./../../business/processors/functional/interpro/InterproCountTableProcessor";
import InterproOntologyProcessor from "./../../business/ontology/functional/interpro/InterproOntologyProcessor";
import { InterproNamespace } from "./../../business/ontology/functional/interpro/InterproNamespace";
import StringUtils from "./../../business/misc/StringUtils";
import PeptideCountTableProcessor from "./../../business/processors/raw/PeptideCountTableProcessor";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";

type DefinitionType = (FunctionalDefinition | NcbiTaxon)

type SourceMetadata = {
    items: MultiAssayDataSourceItem[],
    tableProcessor: (countTable: CountTable<Peptide>, config: SearchConfiguration) => ProteomicsCountTableProcessor<OntologyIdType>,
    ontologyProcessor: OntologyProcessor<OntologyIdType, DefinitionType>,
    loading: boolean,
    categories: string[],
    // What's the title of the category column that should be shown in the data table?
    categoryTitle: string,
    // Should the identifier be shown in the data source table instead of the category name?
    showIdentifier: boolean
};

@Component({
    components: {
        DataSource
    },
    computed: {
        selectedIndex: {
            get(): number {
                return this.datasources.indexOf(this.datasource);
            }
        },
        headers: {
            get() {
                return [
                    {
                        text: "Name",
                        align: "left",
                        value: "name",
                        width: "30%"
                    },
                    {
                        text:  this.identifierInsteadOfCategory ? "Identifier" : "Rank",
                        align: "left",
                        value: this.identifierInsteadOfCategory ? "id" : "category",
                        width: "30%"
                    },
                    {
                        text: "# Peptides",
                        align: "left",
                        value: "count",
                        width: "20%"
                    },
                    {
                        text: "# Assays",
                        align: "left",
                        value: "assayCount",
                        width: "20%"
                    }
                ];
            }
        }
    }
})
export default class MultiAssayDataSource extends Vue {
    @Prop({ required: true })
    private assays: ProteomicsAssay[];

    /**
     * Show every items identifier in the table instead of the category it belongs to?
     */
    private identifierInsteadOfCategory: boolean = false;
    private categoryTitle: string = "";


    private datasources: string[] = [
        "NCBI taxonomy",
        "Gene Ontology",
        "Enzyme Commission",
        "Interpro"
    ];

    private datasource: string = this.datasources[0];

    private sourceMetadata: SourceMetadata[] = [
        {
            items: [],
            loading: true,
            tableProcessor: (p: CountTable<Peptide>, c: SearchConfiguration) => new LcaCountTableProcessor(p, c),
            ontologyProcessor: new NcbiOntologyProcessor(),
            categories: Object.values(NcbiRank).map(StringUtils.stringTitleize),
            showIdentifier: false,
            categoryTitle: "Rank"
        },
        {
            items: [],
            loading: true,
            tableProcessor: (p: CountTable<Peptide>, c: SearchConfiguration) => new GoCountTableProcessor(p, c),
            ontologyProcessor: new GoOntologyProcessor(),
            categories: Object.values(GoNamespace).map(StringUtils.stringTitleize),
            showIdentifier: true,
            categoryTitle: "Namespace"
        },
        {
            items: [],
            loading: true,
            tableProcessor: (p: CountTable<Peptide>, c: SearchConfiguration) => new EcCountTableProcessor(p, c),
            ontologyProcessor: new EcOntologyProcessor(),
            categories: Object.values(EcNamespace).map(StringUtils.stringTitleize),
            showIdentifier: true,
            categoryTitle: "Namespace"
        },
        {
            items: [],
            loading: true,
            tableProcessor: (p: CountTable<Peptide>, c: SearchConfiguration) => new InterproCountTableProcessor(p, c),
            ontologyProcessor: new InterproOntologyProcessor(),
            categories: Object.values(InterproNamespace).map(StringUtils.stringTitleize),
            showIdentifier: true,
            categoryTitle: "Namespace"
        }
    ];

    mounted() {
        this.updateItems();
    }

    @Watch("datasource")
    private onDatasourceChanged() {
        const idx = this.datasources.indexOf(this.datasource);
        this.identifierInsteadOfCategory = this.sourceMetadata[idx].showIdentifier;
        this.categoryTitle = this.sourceMetadata[idx].categoryTitle;

    }

    private updateDatasource(value: string) {
        this.datasource = value;
    }

    @Watch("assays")
    private async updateItems() {
        for (const item of this.sourceMetadata) {
            await this.computeItems(item);
        }
    }

    private onSelectedItems(items) {
        this.$emit("selected-items", items);
    }

    private async computeItems(dataItem: SourceMetadata) {
        if (this.assays && this.assays.length > 0) {
            dataItem.loading = true;

            // Maps an annotation onto a tuple that keeps track of the counts. Every ontology id is mapped onto a new
            // map that keeps track of the amount of peptides associated with this annotation per assay id.
            const definitionCountMap = new Map<OntologyIdType, Map<string, number>>();

            for (const assay of this.assays) {
                const peptideCountProcessor = new PeptideCountTableProcessor();
                const peptideCountTable = await peptideCountProcessor.getPeptideCountTable(assay.getPeptides(), assay.getSearchConfiguration());

                const countProcessor = dataItem.tableProcessor(peptideCountTable, assay.getSearchConfiguration());
                const countTable = await countProcessor.getCountTable();

                for (const ontologyId of countTable.getOntologyIds()) {
                    if (!definitionCountMap.has(ontologyId)) {
                        definitionCountMap.set(ontologyId, new Map());
                    }
                    definitionCountMap.get(ontologyId).set(assay.getId(), countTable.getCounts(ontologyId));
                }
            }

            const ontologyProcessor = dataItem.ontologyProcessor;
            const ontology = await ontologyProcessor.getOntologyByIds(Array.from(definitionCountMap.keys()));

            const items: MultiAssayDataSourceItem[] = [];
            for (const [ontologyId, countMap] of definitionCountMap) {
                const definition = ontology.getDefinition(ontologyId);

                let category: string = "";
                let name: string = "";

                if (definition) {
                    if (definition instanceof NcbiTaxon) {
                        category = definition.rank;
                    } else {
                        category = (definition as FunctionalDefinition).namespace;
                    }
                    name = definition.name;
                }

                items.push(new MultiAssayDataSourceItem(
                    name,
                    ontologyId,
                    Array.from(countMap.values()).reduce((acc, current) => acc + current, 0),
                    category,
                    countMap.size,
                    countMap
                ));
            }

            dataItem.items.length = 0;
            dataItem.items.push(...items);
            dataItem.loading = false;
        } else {
            dataItem.items.length = 0;
            dataItem.loading = false;
        }
    }
}
</script>

<style scoped>

</style>
