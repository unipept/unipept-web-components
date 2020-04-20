import {NormalizationType} from "./NormalizationType";

<template>
    <v-stepper v-model="currentStep" class="heatmap-wizard">
        <v-stepper-header>
            <v-stepper-step editable :complete="currentStep > 1" step="1">Data source</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 2" step="2">Normalisation</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 3" step="3" @click="computeHeatmapAndProceed()">
                Heatmap
            </v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
            <v-stepper-content step="1">
                <p>Please select type of data that should be compared between samples.</p>
                <v-select :items="dataSources" v-model="dataSource" label="Datasource" class="flex-grow-0"></v-select>
                <div>
                    <multi-assay-data-source
                        :items="sourceMetadata[selectedIndex].items"
                        :categories="sourceMetadata[selectedIndex].categories"
                        :loading="sourceMetadata[selectedIndex].loading"
                        :identifier-instead-of-category="sourceMetadata[selectedIndex].showIdentifier"
                        :category-title="sourceMetadata[selectedIndex].categoryTitle"
                        v-on:selected-items="updateSelectedItems">
                    </multi-assay-data-source>
                </div>
                <v-spacer></v-spacer>
                <v-btn class="continue-button" color="primary" @click="currentStep++">Continue</v-btn>
            </v-stepper-content>
            <v-stepper-content step="2">
                <p>Please select the type of normalization that should be performed before visualizing data points.</p>
                <v-radio-group v-model="normalizer">
                    <div
                        v-for="normalizationType in Array.from(normalizationTypes.keys())"
                        :key="normalizationType" style="margin-bottom: 8px;">
                        <v-radio :label="normalizationType" :value="normalizationType"></v-radio>
                        <div style="margin-left: 32px;">
                            {{ normalizationTypes.get(normalizationType).information }}
                        </div>
                    </div>
                </v-radio-group>
                <v-btn class="continue-button" color="primary" @click="computeHeatmapAndProceed()">Continue</v-btn>
            </v-stepper-content>
            <v-stepper-content step="3">
                <div v-if="selectedItems.length === 0">
                    Please select at least one item for both axis of the heatmap.
                </div>
                <div v-else class="reorder-heatmap-buttons">
                    <div
                        v-if="!heatmapData && selectedItems.length !== 0"
                        style="display: flex; justify-content: center;">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </div>
                    <heatmap-visualization
                        v-if="heatmapData && selectedItems.length !== 0"
                        :data="heatmapData"
                        :clusterRows="clusterRows"
                        :clusterColumns="clusterColumns">
                    </heatmap-visualization>
                </div>
            </v-stepper-content>
        </v-stepper-items>
    </v-stepper>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch, Prop } from "vue-property-decorator";
import { HeatmapData, HeatmapElement } from "unipept-heatmap/heatmap/input";
import HeatmapVisualization from "./HeatmapVisualization.vue";
import sha256 from "crypto-js/sha256";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import MultiAssayDataSource from "./MultiAssayDataSource.vue";
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
import AllNormalizer from "./../../business/normalisation/AllNormalizer";
import RowNormalizer from "./../../business/normalisation/RowNormalizer";
import ColumnNormalizer from "./../../business/normalisation/ColumnNormalizer";
import Normalizer from "./../../business/normalisation/Normalizer";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";
import PeptideCountTableProcessor from "./../../business/processors/raw/PeptideCountTableProcessor";

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
    components: { MultiAssayDataSource, HeatmapVisualization },
    computed: {
        selectedIndex: {
            get(): number {
                return this.dataSources.indexOf(this.dataSource);
            }
        }
    }
})
export default class HeatmapWizardMultiSample extends Vue {
    @Prop({ required: true })
    private assays: ProteomicsAssay[];

    private clusterRows: boolean = true;
    private clusterColumns: boolean = true;

    private heatmapLoading: boolean = false;

    private currentStep: number = 1;

    private heatmapData: HeatmapData = null;
    // Keeps track of a hash of the previously computed data for the heatmap
    private previouslyComputed: string = "";

    private dataSources: string[] = [
        "NCBI taxonomy",
        "Gene Ontology",
        "Enzyme Commission",
        "Interpro"
    ];

    private dataSource: string = this.dataSources[0];

    private selectedItems: MultiAssayDataSourceItem[] = [];
    private normalizer: string = "";

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

    private normalizationTypes: Map<string, {information: string, factory: () => Normalizer}> = new Map([
        [
            "All",
            {
                information: "Normalize over all data points of the input.",
                factory: () => new AllNormalizer()
            }
        ],
        [
            "Rows",
            {
                information: "Normalize values on a row-per-row basis.",
                factory: () => new RowNormalizer()
            }
        ],
        [
            "Columns",
            {
                information: "Normalize values on a column-per-column basis.",
                factory: () => new ColumnNormalizer()
            }
        ]
    ]);

    created() {
        this.normalizer = this.normalizationTypes.keys().next().value;
    }

    mounted() {
        this.onPeptideCountTableChanged();
    }

    private updateSelectedItems(newItems: MultiAssayDataSourceItem[]) {
        this.selectedItems = newItems;
    }

    @Watch("peptideCountTable")
    @Watch("searchConfiguration")
    private async onPeptideCountTableChanged() {
        this.currentStep = 1;

        for (const item of this.sourceMetadata) {
            await this.computeItems(item);
        }
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
                    if (definition instanceof FunctionalDefinition) {
                        category = definition.namespace;
                    }

                    if (definition instanceof NcbiTaxon) {
                        category = definition.rank;
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
        }
    }

    private async computeHeatmapAndProceed() {
        let newHash = sha256(this.normalizer + this.dataSource + this.selectedItems.toString()).toString();

        if (newHash === this.previouslyComputed) {
            return;
        }

        this.previouslyComputed = newHash;

        // Go the next step in the wizard.
        this.currentStep = 3;

        let rows: HeatmapElement[] = [];
        let cols: HeatmapElement[] = [];

        let grid: number[][] = [];

        for (let i = 0; i < this.selectedItems.length; i++) {
            let item: MultiAssayDataSourceItem = this.selectedItems[i];
            rows.push({ id: i.toString(), name: item.name });
        }

        for (let i = 0; i < this.assays.length; i++) {
            let item: ProteomicsAssay = this.assays[i];
            cols.push({ id: i.toString(), name: item.getName() });
        }

        for (let item of this.selectedItems) {
            let gridRow: number[] = [];
            for (let assay of this.assays) {
                const values: number = item.countPerAssayId.get(assay.id);
                gridRow.push(values ? values : 0);
            }
            grid.push(gridRow);
        }

        this.heatmapData = {
            rows: rows,
            columns: cols,
            values: this.normalizationTypes.get(this.normalizer).factory().normalize(grid)
        };
    }
}
</script>

<style>
    .v-stepper__wrapper {
        display: flex;
        flex-direction: column;
    }

    .continue-button {
        align-self: flex-end;
    }
</style>
