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
                <v-select :items="dataSources" v-model="horizontalDataSource" label="Horizontal datasource" class="flex-grow-0">
                </v-select>
                <div>
                    <single-assay-data-source
                        :items="sourceMetadata[horizontalIndex].items"
                        :categories="sourceMetadata[horizontalIndex].categories"
                        :loading="sourceMetadata[horizontalIndex].loading"
                        :identifier-instead-of-category="sourceMetadata[horizontalIndex].showIdentifier"
                        :category-title="sourceMetadata[horizontalIndex].categoryTitle"
                        v-on:selected-items="updateHorizontalItems">
                    </single-assay-data-source>
                </div>
                <v-spacer></v-spacer>
                <v-btn class="continue-button" color="primary" @click="currentStep++">Continue</v-btn>
            </v-stepper-content>
            <v-stepper-content step="2">
                <p>Please select the items that should be visualised on the vertical axis of the heatmap.</p>
                <v-select :items="dataSources" v-model="verticalDataSource" label="Vertical datasource" class="flex-grow-0">
                </v-select>
                <div>
                    <single-assay-data-source
                        :items="sourceMetadata[verticalIndex].items"
                        :categories="sourceMetadata[verticalIndex].categories"
                        :loading="sourceMetadata[verticalIndex].loading"
                        :identifier-instead-of-category="sourceMetadata[verticalIndex].showIdentifier"
                        :category-title="sourceMetadata[verticalIndex].categoryTitle"
                        v-on:selected-items="updateVerticalItems">
                    </single-assay-data-source>
                </div>
                <v-spacer></v-spacer>
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
import NcbiTaxon, { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import AllNormalizer from "./../../business/normalisation/AllNormalizer";
import RowNormalizer from "./../../business/normalisation/RowNormalizer";
import ColumnNormalizer from "./../../business/normalisation/ColumnNormalizer";
import Normalizer from "./../../business/normalisation/Normalizer";
import DataSource from "./DataSource.vue";
import SingleAssayDataSourceItem from "./SingleAssayDataSourceItem";
import { NcbiRank } from "./../../business/ontology/taxonomic/ncbi/NcbiRank";
import { GoNamespace } from "./../../business/ontology/functional/go/GoNamespace";
import { EcNamespace } from "./../../business/ontology/functional/ec/EcNamespace";
import { InterproNamespace } from "./../../business/ontology/functional/interpro/InterproNamespace";
import LcaCountTableProcessor from "./../../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import GoCountTableProcessor from "./../../business/processors/functional/go/GoCountTableProcessor";
import EcCountTableProcessor from "./../../business/processors/functional/ec/EcCountTableProcessor";
import InterproCountTableProcessor from "./../../business/processors/functional/interpro/InterproCountTableProcessor";
import FunctionalDefinition from "./../../business/ontology/functional/FunctionalDefinition";
import SingleAssayDataSource from "./SingleAssayDataSource.vue";
import { Ontology, OntologyIdType } from "./../../business/ontology/Ontology";
import StringUtils from "./../../business/misc/StringUtils";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";
import GoDefinition, { GoCode } from "./../../business/ontology/functional/go/GoDefinition";
import EcDefinition, { EcCode } from "./../../business/ontology/functional/ec/EcDefinition";
import InterproDefinition, { InterproCode } from "./../../business/ontology/functional/interpro/InterproDefinition";
import { Tree } from "@/business";

type DefinitionType = (FunctionalDefinition | NcbiTaxon)

type SourceMetadata = {
    items: SingleAssayDataSourceItem[],
    loading: boolean,
    categories: string[],
    // What's the title of the category column that should be shown in the data table?
    categoryTitle: string,
    // Should the identifier be shown in the data source table instead of the category name?
    showIdentifier: boolean
};

@Component({
    components: {
        SingleAssayDataSource,
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
    private assay: ProteomicsAssay;

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

    private horizontalItems: SingleAssayDataSourceItem[] = [];
    private verticalItems: SingleAssayDataSourceItem[] = [];

    private normalizer: string = "";

    private sourceMetadata: SourceMetadata[] = [
        {
            items: [],
            loading: true,
            categories: Object.values(NcbiRank).map(StringUtils.stringTitleize),
            showIdentifier: false,
            categoryTitle: "Rank"
        },
        {
            items: [],
            loading: true,
            categories: Object.values(GoNamespace).map(StringUtils.stringTitleize),
            showIdentifier: true,
            categoryTitle: "Namespace"
        },
        {
            items: [],
            loading: true,
            categories: Object.values(EcNamespace).map(StringUtils.stringTitleize),
            showIdentifier: true,
            categoryTitle: "Namespace"
        },
        {
            items: [],
            loading: true,
            categories: Object.values(InterproNamespace).map(StringUtils.stringTitleize),
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

    get peptideCountTable(): CountTable<Peptide> {
        return this.$store.getters["assayData"](this.assay)?.peptideCountTable;
    }

    get ncbiCountTableProcessor(): LcaCountTableProcessor {
        return this.$store.getters["ncbi/originalData"](this.assay)?.processor;
    }

    get ncbiOntology(): Ontology<NcbiId, NcbiTaxon> {
        return this.$store.getters["ncbi/ontology"](this.assay);
    }

    get goCountTableProcessor(): GoCountTableProcessor {
        return this.$store.getters["go/originalData"](this.assay)?.processor;
    }

    get goOntology(): Ontology<GoCode, GoDefinition> {
        return this.$store.getters["go/ontology"](this.assay);
    }

    get ecCountTableProcessor(): EcCountTableProcessor {
        return this.$store.getters["ec/originalData"](this.assay)?.processor;
    }

    get ecOntology(): Ontology<EcCode, EcDefinition> {
        return this.$store.getters["ec/ontology"](this.assay);
    }

    get interproCountTableProcessor(): InterproCountTableProcessor {
        return this.$store.getters["interpro/originalData"](this.assay)?.processor;
    }

    get interproOntology(): Ontology<InterproCode, InterproDefinition> {
        return this.$store.getters["interpro/ontology"](this.assay);
    }

    get tree(): Tree {
        return this.$store.getters["ncbi/tree"](this.assay);
    }

    @Watch("peptideCountTable", { immediate: true })
    @Watch("ncbiCountTableProcessor")
    @Watch("ncbiOntology")
    private async onNcbiChanged() {
        if (this.peptideCountTable && this.ncbiCountTableProcessor && this.ncbiOntology) {
            await this.computeItems(this.sourceMetadata[0], this.ncbiCountTableProcessor, this.ncbiOntology);
        }
    }

    @Watch("peptideCountTable", { immediate: true })
    @Watch("goCountTableProcessor")
    @Watch("goOntology")
    private async onGoChanged() {
        if (this.peptideCountTable && this.goCountTableProcessor && this.goOntology) {
            await this.computeItems(this.sourceMetadata[1], this.goCountTableProcessor, this.goOntology);
        }
    }

    @Watch("peptideCountTable", { immediate: true })
    @Watch("ecCountTableProcessor")
    @Watch("ecOntology")
    private async onEcChanged() {
        if (this.peptideCountTable && this.ecCountTableProcessor && this.ecOntology) {
            await this.computeItems(this.sourceMetadata[2], this.ecCountTableProcessor, this.ecOntology);
        }
    }

    @Watch("peptideCountTable", { immediate: true })
    @Watch("interproCountTableProcessor")
    @Watch("interproOntology")
    private async onInterproChanged() {
        if (this.peptideCountTable && this.interproCountTableProcessor && this.interproOntology) {
            await this.computeItems(this.sourceMetadata[3], this.interproCountTableProcessor, this.interproOntology);
        }
    }

    private async computeItems<O extends OntologyIdType, D extends DefinitionType>(
        dataItem: SourceMetadata,
        countProcessor,
        ontology: Ontology<O, D>
    ) {
        if (this.peptideCountTable) {
            dataItem.loading = true;

            const countTable = await countProcessor.getCountTable();
            const peptideMapping = await countProcessor.getAnnotationPeptideMapping();

            const items = [];
            for (const id of countTable.getOntologyIds()) {
                const definition = ontology.getDefinition(id);

                if (!definition) {
                    continue;
                }

                let category: string = "";
                let count: number = 0;

                if ("rank" in definition) {
                    category = definition["rank"];
                    count = this.tree.nodes.get(id)?.data.count;
                } else {
                    category = (definition as unknown as FunctionalDefinition).namespace;
                    count = countTable.getCounts(id);
                }

                items.push(new SingleAssayDataSourceItem(
                    definition.name,
                    id,
                    count,
                    StringUtils.stringTitleize(category),
                    peptideMapping.get(id)
                ));
            }

            items.sort((a: SingleAssayDataSourceItem, b: SingleAssayDataSourceItem) => b.count - a.count);

            dataItem.items.length = 0;
            dataItem.items.push(...items);
            dataItem.loading = false;
        }
    }

    private updateHorizontalItems(items: SingleAssayDataSourceItem[]) {
        this.horizontalItems.length = 0;
        this.horizontalItems.push(...items);
    }

    private updateVerticalItems(items: SingleAssayDataSourceItem[]) {
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
            let vertical: SingleAssayDataSourceItem = this.verticalItems[i];
            rows.push({ id: i.toString(), name: vertical.name });
        }

        for (let i = 0; i < this.horizontalItems.length; i++) {
            let horizontal: SingleAssayDataSourceItem = this.horizontalItems[i];
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
