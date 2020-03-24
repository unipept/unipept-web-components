import {NormalizationType} from "./NormalizationType";

<template>
    <v-stepper v-model="currentStep" class="heatmap-wizard">
        <v-stepper-header>
            <v-stepper-step editable :complete="currentStep > 1" step="1">Horizontal axis</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 2" step="2">Vertical axis</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 3" step="3">Normalisation</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 4" step="4" @click="computeHeatmapAndProceed()">
                Heatmap
            </v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
            <v-stepper-content step="1">
                <p>Please select the items that should be visualised on the horizontal axis of the heatmap.</p>
                <v-select :items="dataSources" v-model="horizontalDataSource" label="Horizontal datasource">
                </v-select>
                <div>
                    <data-source
                        :items="countTables[horizontalIndex].items"
                        :categories="countTables[horizontalIndex].categories"
                        :loading="countTables[horizontalIndex].loading"
                        :identifier-instead-of-category="countTables[horizontalIndex].showIdentifier"
                        :category-title="countTables[horizontalIndex].categoryTitle"
                        v-on:selected-items="updateHorizontalItems">
                    </data-source>
                </div>
                <v-btn class="continue-button" color="primary" @click="currentStep++">Continue</v-btn>
            </v-stepper-content>
            <v-stepper-content step="2">
                <p>Please select the items that should be visualised on the vertical axis of the heatmap.</p>
                <v-select :items="dataSources" v-model="verticalDataSource" label="Vertical datasource">
                </v-select>
                <div>
                    <data-source
                        :items="countTables[verticalIndex].items"
                        :categories="countTables[verticalIndex].categories"
                        :loading="countTables[verticalIndex].loading"
                        :identifier-instead-of-category="countTables[verticalIndex].showIdentifier"
                        :category-title="countTables[verticalIndex].categoryTitle"
                        v-on:selected-items="updateVerticalItems">
                    </data-source>
                </div>
                <v-btn class="continue-button" color="primary" @click="currentStep++">Continue</v-btn>
            </v-stepper-content>
            <v-stepper-content step="3">
                <p>Please select the type of normalization that should be performed before visualizing data points.</p>
                <v-radio-group v-model="normalizer">
                    <div
                        v-for="normalizationType in Array.from(normalizationTypes.keys())"
                        :key="normalizationType"
                        style="margin-bottom: 8px;">
                        <v-radio :label="normalizationType" :value="normalizationType"></v-radio>
                        <div style="margin-left: 32px;">{{ normalizationTypes.get(normalizationType).information }}</div>
                    </div>
                </v-radio-group>
                <v-btn class="continue-button" color="primary" @click="computeHeatmapAndProceed()">Continue</v-btn>
            </v-stepper-content>
            <v-stepper-content step="4">
                <div v-if="horizontalItems.length === 0 || verticalItems.length === 0">
                    Please select at least one item for both axis of the heatmap.
                </div>
                <v-progress-circular v-else-if="!heatmapData" indeterminate color="primary"></v-progress-circular>
                <heatmap-visualization v-else :data="heatmapData"></heatmap-visualization>
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
import { Peptide } from "./../../business/ontology/raw/Peptide";
import { CountTable } from "./../../business/counts/CountTable";
import { GoCode } from "./../../business/ontology/functional/go/GoDefinition";
import { EcCode } from "./../../business/ontology/functional/ec/EcDefinition";
import { InterproCode } from "./../../business/ontology/functional/interpro/InterproDefinition";
import NcbiTaxon, { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import AllNormalizer from "./../../business/normalisation/AllNormalizer";
import RowNormalizer from "./../../business/normalisation/RowNormalizer";
import ColumnNormalizer from "./../../business/normalisation/ColumnNormalizer";
import Normalizer from "./../../business/normalisation/Normalizer";
import DataSource from "./DataSource.vue";
import DataSourceItem from "./DataSourceItem";
import { NcbiRank } from "./../../business/ontology/taxonomic/ncbi/NcbiRank";
import { GoNamespace } from "./../../business/ontology/functional/go/GoNamespace";
import { EcNamespace } from "./../../business/ontology/functional/ec/EcNamespace";
import { InterproNamespace } from "./../../business/ontology/functional/interpro/InterproNamespace";
import LcaCountTableProcessor from "./../../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import NcbiOntologyProcessor from "./../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import ProteomicsCountTableProcessor from "./../../business/processors/ProteomicsCountTableProcessor";
import OntologyProcessor from "./../../business/ontology/OntologyProcessor";
import GoCountTableProcessor from "./../../business/processors/functional/go/GoCountTableProcessor";
import EcCountTableProcessor from "./../../business/processors/functional/ec/EcCountTableProcessor";
import InterproCountTableProcessor from "./../../business/processors/functional/interpro/InterproCountTableProcessor";
import GoOntologyProcessor from "./../../business/ontology/functional/go/GoOntologyProcessor";
import EcOntologyProcessor from "./../../business/ontology/functional/ec/EcOntologyProcessor";
import InterproOntologyProcessor from "./../../business/ontology/functional/interpro/InterproOntologyProcessor";
import FunctionalDefinition from "./../../business/ontology/functional/FunctionalDefinition";

type OntologyType = (GoCode | EcCode | InterproCode | NcbiId);
type DefinitionType = (FunctionalDefinition | NcbiTaxon)

type SourceMetadata = {
    items: DataSourceItem[],
    tableProcessor: (countTable: CountTable<Peptide>, config: SearchConfiguration) => ProteomicsCountTableProcessor<OntologyType>,
    ontologyProcessor: OntologyProcessor<OntologyType, DefinitionType>,
    loading: boolean,
    categories: string[],
    // What's the title of the category column that should be shown in the data table?
    categoryTitle: string,
    // Should the identifier be shown in the data source table instead of the category name?
    showIdentifier: boolean
};

@Component({
    components: {
        HeatmapVisualization,
        DataSource
    },
    computed: {
        horizontalIndex: {
            get(): number {
                return this.dataSources.indexOf(this.horizontalDataSource);
            }
        },
        verticalIndex: {
            get(): number {
                return this.dataSources.indexOf(this.verticalDataSource);
            }
        }
    }
})
export default class HeatmapWizardSingleSample extends Vue {
    @Prop({ required: true })
    private peptideCountTable: CountTable<Peptide>;
    @Prop({ required: true })
    private searchConfiguration: SearchConfiguration;

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

    private horizontalDataSource: string = this.dataSources[0];
    private verticalDataSource: string = this.dataSources[0];

    private horizontalItems: DataSourceItem[] = [];
    private verticalItems: DataSourceItem[] = [];

    private normalizer: string = "";

    private countTables: SourceMetadata[] = [
        {
            items: [],
            loading: true,
            tableProcessor: (p: CountTable<Peptide>, c: SearchConfiguration) => new LcaCountTableProcessor(p, c),
            ontologyProcessor: new NcbiOntologyProcessor(),
            categories: Object.values(NcbiRank).map(this.capitalize),
            showIdentifier: false,
            categoryTitle: "Rank"
        },
        {
            items: [],
            loading: true,
            tableProcessor: (p: CountTable<Peptide>, c: SearchConfiguration) => new GoCountTableProcessor(p, c),
            ontologyProcessor: new GoOntologyProcessor(),
            categories: Object.values(GoNamespace).map(this.capitalize),
            showIdentifier: true,
            categoryTitle: "Namespace"
        },
        {
            items: [],
            loading: true,
            tableProcessor: (p: CountTable<Peptide>, c: SearchConfiguration) => new EcCountTableProcessor(p, c),
            ontologyProcessor: new EcOntologyProcessor(),
            categories: Object.values(EcNamespace).map(this.capitalize),
            showIdentifier: true,
            categoryTitle: "Namespace"
        },
        {
            items: [],
            loading: true,
            tableProcessor: (p: CountTable<Peptide>, c: SearchConfiguration) => new InterproCountTableProcessor(p, c),
            ontologyProcessor: new InterproOntologyProcessor(),
            categories: Object.values(InterproNamespace).map(this.capitalize),
            showIdentifier: true,
            categoryTitle: "Namespace"
        }
    ]

    private normalizationTypes: Map<string, { information: string, factory: () => Normalizer }> = new Map([
        [
            "All",
            {
                information: "Normalize over all data points of the input.",
                factory: () => new AllNormalizer()
            }
        ], [
            "Rows",
            {
                information: "Normalize values on a row-per-row basis.",
                factory: () => new RowNormalizer()
            }
        ], [
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

    @Watch("peptideCountTable")
    private async onPeptideCountTableChanged() {
        // Switch back to the first step of the configuration.
        this.currentStep = 1;

        // Update all data source items
        for (const item of this.countTables) {
            await this.computeItems(item);
        }
    }

    private capitalize(input: string): string {
        return input.split(" ").map(el => el.length > 0 ? el.substr(0, 1).toUpperCase() + el.substr(1) : el).join(" ");
    }

    @Watch("peptideCountTable")
    @Watch("searchConfiguration")
    private async computeItems(dataItem: SourceMetadata) {
        if (this.peptideCountTable && this.searchConfiguration) {
            dataItem.loading = true;
            const countProcessor = dataItem.tableProcessor(this.peptideCountTable, this.searchConfiguration);

            const countTable = await countProcessor.getCountTable();
            const peptideMapping = await countProcessor.getAnnotationPeptideMapping();

            const ontologyProcessor = dataItem.ontologyProcessor;
            const ontology = await ontologyProcessor.getOntology(countTable);

            const items = countTable.getOntologyIds().map(id => {
                const definition = ontology.getDefinition(id);
                let category: string = "";

                if (definition instanceof FunctionalDefinition) {
                    category = definition.namespace;
                }

                if (definition instanceof NcbiTaxon) {
                    category = definition.rank;
                }

                return new DataSourceItem(definition.name, id, countTable.getCounts(id), this.capitalize(category), peptideMapping.get(id))
            }).sort((a: DataSourceItem, b: DataSourceItem) => b.count - a.count);

            dataItem.items.length = 0;
            dataItem.items.push(...items);
            dataItem.loading = false;
        }
    }

    private updateHorizontalItems(items: DataSourceItem[]) {
        this.horizontalItems.length = 0;
        this.horizontalItems.push(...items);
    }

    private updateVerticalItems(items: DataSourceItem[]) {
        this.verticalItems.length = 0;
        this.verticalItems.push(...items);
    }

    /**
     * Compute a new heatmap when required. This means that the selected items, normalization or data source did change.
     * If none of these items were updated, the previously computed heatmap is used.
     */
    private async computeHeatmapAndProceed() {
        let newHash = sha256(this.normalizer + this.horizontalDataSource + this.verticalDataSource + this.horizontalItems.toString() + this.verticalItems.toString()).toString();

        if (newHash === this.previouslyComputed) {
            return;
        }

        this.previouslyComputed = newHash;

        // Go the next step in the wizard.
        this.currentStep = 4;

        let rows: HeatmapElement[] = [];
        let cols: HeatmapElement[] = [];

        let grid: number[][] = [];

        for (let i = 0; i < this.verticalItems.length; i++) {
            let vertical: DataSourceItem = this.verticalItems[i];
            rows.push({ id: i.toString(), name: vertical.name });
        }

        for (let i = 0; i < this.horizontalItems.length; i++) {
            let horizontal: DataSourceItem = this.horizontalItems[i];
            cols.push({ id: i.toString(), name: horizontal.name });
        }

        for (let vertical of this.verticalItems) {
            let gridRow: number[] = [];
            for (let horizontal of this.horizontalItems) {
                let value: number = await this.computeCrossPopularity(vertical.peptides, horizontal.peptides);
                gridRow.push(value);
            }
            grid.push(gridRow);
        }

        this.heatmapData = {
            rows: rows,
            columns: cols,
            values: this.normalizationTypes.get(this.normalizer).factory().normalize(grid)
        };
    }

    private computeCrossPopularity(ownSequences: Readonly<string[]>, otherSequences: Readonly<string[]>): number {
        return otherSequences.reduce((acc: number, current: string) => acc + (ownSequences.includes(current) ? 1 : 0), 0);
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

.heatmap {
    display: flex;
}

.heatmap > svg {
    margin: auto;
}
</style>
