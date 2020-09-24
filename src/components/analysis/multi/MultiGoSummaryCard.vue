<docs>
    A variant of the GoSummaryCard specifically designed for the analysis of multiple peptides. This variant works
    with a PeptideCountTable as input and provides the counted GO-terms in function of the amount of peptides associated
    with it.
</docs>

<template>
    <v-card flat>
        <v-card-text>
            <div v-if="!isComputing">
                <filter-functional-annotations-dropdown v-model="percentSettings">
                </filter-functional-annotations-dropdown>
                <span>This panel shows the Gene Ontology annotations that were matched to your peptides. </span>
                <span v-html="trustLine"></span>
                <span>Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
            </div>
            <go-summary
                v-for="computedItem of computedItems"
                :key="computedItem.namespace"
                :item-retriever="computedItem.itemRetriever"
                :definitions="computedItem.definitions"
                :namespace="computedItem.namespace"
                :items-to-peptides="itemsToPeptides"
                :taxa-to-peptides="taxaToPeptides"
                :tree="tree"
                :show-percentage="showPercentage"
                :loading="isComputing || goOntology === undefined || goCountTableProcessor === undefined"
                :item-to-csv-summary="saveSummaryAsCsv">
            </go-summary>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import FilterFunctionalAnnotationsDropdown from "./../functional/FilterFunctionalAnnotationsDropdown.vue";
import { Prop, Watch } from "vue-property-decorator";
import GoSummary from "./../functional/GoSummary.vue";

import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import {
    CountTable,
    CsvUtils,
    FunctionalSummaryProcessor,
    FunctionalTrust,
    GoCode,
    GoDefinition,
    GoNamespace,
    NcbiId,
    NcbiOntologyProcessor,
    NetworkUtils,
    Ontology,
    Pept2DataCommunicator,
    Peptide,
    PeptideCountTableProcessor,
    ProteomicsAssay,
    Tree
} from "@/business";
import GoCountTableProcessor from "@/business/processors/functional/go/GoCountTableProcessor";
import LcaCountTableProcessor from "@/business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import CommunicationSource from "@/business/communication/source/CommunicationSource";
import FunctionalCountTableProcessor from "@/business/processors/functional/FunctionalCountTableProcessor";
import MultiAmountTableItemRetriever from "@/components/analysis/multi/MultiAmountTableItemRetriever";
import { FunctionalUtils } from "@/components/analysis/functional/FunctionalUtils";

@Component({
    components: {
        GoSummary,
        FilterFunctionalAnnotationsDropdown
    }
})
export default class MultiGoSummaryCard extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: false, default: false })
    private showPercentage: boolean;

    private trustLine: string = "";
    private percentSettings: string = "5";

    private isComputing: boolean = false;

    private computedItems: {
        itemRetriever: AmountTableItemRetriever<GoCode, GoDefinition>,
        definitions: GoDefinition[],
        namespace: string
    }[] = [];

    private taxaToPeptides: Map<NcbiId, Peptide[]> = null;
    private itemsToPeptides: Map<GoCode, Peptide[]> = null;

    get peptideCountTable(): CountTable<Peptide> {
        return this.$store.getters.assayData(this.assay)?.filteredPeptideCountTable;
    }

    get goCountTableProcessor(): GoCountTableProcessor {
        return this.$store.getters["go/filteredData"](this.assay)?.processor;
    }

    get goOntology(): Ontology<GoCode, GoDefinition> {
        return this.$store.getters["go/ontology"](this.assay);
    }

    get tree(): Tree {
        return this.$store.getters["ncbi/tree"](this.assay);
    }

    get ncbiCountTableProcessor(): LcaCountTableProcessor {
        return this.$store.getters["ncbi/originalData"](this.assay)?.processor;
    }

    get filterPercentage(): number {
        return this.$store.getters.assayData(this.assay)?.filterPercentage;
    }

    get communicationSource(): CommunicationSource {
        return this.$store.getters.assayData(this.assay)?.communicationSource;
    }

    get pept2DataCommunicator(): Pept2DataCommunicator {
        return this.$store.getters.assayData(this.assay)?.pept2dataCommunicator;
    }

    get ncbiOntologyProcessor(): NcbiOntologyProcessor {
        return this.$store.getters["ncbi/ontology"](this.assay)?.processor;
    }

    private mounted() {
        for (const namespace of Object.values(GoNamespace).sort()) {
            this.computedItems.push({
                itemRetriever: undefined,
                definitions: [],
                namespace: namespace
            });
        }

        this.onInputsChanged();
        this.onNcbiCountTableChanged();
    }

    @Watch("ncbiCountTableProcessor")
    private async onNcbiCountTableChanged() {
        if (this.ncbiCountTableProcessor) {
            this.taxaToPeptides = await this.ncbiCountTableProcessor.getAnnotationPeptideMapping();
        }
    }

    @Watch("goCountTableProcessor")
    @Watch("peptideCountTable")
    @Watch("goOntology")
    @Watch("filterPercentage")
    private async onInputsChanged() {
        this.isComputing = true;

        if (this.peptideCountTable && this.goCountTableProcessor && this.goOntology) {
            for (const [idx, namespace] of Object.values(GoNamespace).sort().entries()) {
                let goCountTable: CountTable<GoCode>;
                let trust: FunctionalTrust;

                if (this.filterPercentage === FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE) {
                    goCountTable = await this.goCountTableProcessor.getCountTable(namespace);
                    this.itemsToPeptides = await this.goCountTableProcessor.getAnnotationPeptideMapping();
                    trust = await this.goCountTableProcessor.getTrust();
                } else {
                    const goProcessor = new GoCountTableProcessor(
                        this.peptideCountTable,
                        this.assay.getSearchConfiguration(),
                        this.communicationSource,
                        this.filterPercentage
                    );

                    goCountTable = await goProcessor.getCountTable(namespace);
                    this.itemsToPeptides = await goProcessor.getAnnotationPeptideMapping();
                    trust = await this.goCountTableProcessor.getTrust();
                }

                const itemRetriever = new MultiAmountTableItemRetriever(
                    goCountTable,
                    this.peptideCountTable,
                    this.goOntology
                );

                const currentObj = this.computedItems[idx];
                currentObj.itemRetriever = itemRetriever;
                currentObj.definitions.splice(0, currentObj.definitions.length);
                currentObj.definitions.push(
                    ...goCountTable.getOntologyIds().map(id => this.goOntology.getDefinition(id))
                );

                this.trustLine = FunctionalUtils.computeTrustLine(trust, "GO-term", "peptide");
            }
        }

        this.isComputing = false;
    }

    private async saveSummaryAsCsv(code: GoCode): Promise<void> {
        const peptideTableProcessor = new PeptideCountTableProcessor();
        const peptideCounts = await peptideTableProcessor.getPeptideCountTable(
            this.itemsToPeptides.get(code),
            this.assay.getSearchConfiguration()
        );

        const functionalSummaryProcessor = new FunctionalSummaryProcessor();
        const data = await functionalSummaryProcessor.summarizeFunctionalAnnotation(
            this.goOntology.getDefinition(code),
            peptideCounts,
            this.assay.getSearchConfiguration(),
            this.pept2DataCommunicator,
            this.ncbiOntologyProcessor
        );

        await NetworkUtils.downloadDataByForm(
            CsvUtils.toCsvString(data),
            code.replace(/:/g, "_") + ".csv",
            "text/csv"
        );
    }
}
</script>

<style scoped>

</style>
