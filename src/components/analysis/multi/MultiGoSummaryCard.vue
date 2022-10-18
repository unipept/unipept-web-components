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
                :loading="isComputing"
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
    CsvUtils, FunctionalNamespace,
    FunctionalSummaryProcessor,
    FunctionalTrust,
    GoCode,
    GoDefinition,
    GoNamespace,
    NcbiId,
    NcbiOntologyProcessor, NcbiTaxon,
    NetworkUtils,
    Ontology,
    Pept2DataCommunicator,
    Peptide,
    PeptideCountTableProcessor, PeptideData,
    ProteomicsAssay,
    Tree
} from "@/business";
import GoCountTableProcessor from "@/business/processors/functional/go/GoCountTableProcessor";
import LcaCountTableProcessor from "@/business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import CommunicationSource from "@/business/communication/source/CommunicationSource";
import FunctionalCountTableProcessor from "@/business/processors/functional/FunctionalCountTableProcessor";
import MultiAmountTableItemRetriever from "@/components/analysis/multi/MultiAmountTableItemRetriever";
import { FunctionalUtils } from "@/components/analysis/functional/FunctionalUtils";
import { ShareableMap } from "shared-memory-datastructures";

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
    }[];

    get ncbiCountTableProcessor(): LcaCountTableProcessor {
        return this.$store.getters.assayData(this.assay)?.originalData?.ncbiCountTableProcessor;
    }

    get ncbiOntology(): Ontology<NcbiId, NcbiTaxon> {
        return this.$store.getters.assayData(this.assay)?.ncbiOntology;
    }

    get pept2data(): ShareableMap<Peptide, PeptideData> {
        return this.$store.getters.assayData(this.assay)?.pept2Data;
    }

    get taxaToPeptides(): Map<NcbiId, Peptide[]> {
        return this.ncbiCountTableProcessor.getAnnotationPeptideMapping();
    }

    get goCountTableProcessor(): GoCountTableProcessor {
        return this.$store.getters.assayData(this.assay)?.filteredData?.goCountTableProcessor;
    }

    get goOntology(): Ontology<GoCode, GoDefinition> {
        return this.$store.getters.assayData(this.assay)?.goOntology;
    }

    get itemsToPeptides(): Map<GoCode, Peptide[]> {
        return this.goCountTableProcessor.getAnnotationPeptideMapping();
    }

    get tree(): Tree {
        return this.$store.getters.assayData(this.assay)?.originalData?.tree;
    }

    get peptideCountTable(): CountTable<Peptide> {
        return this.$store.getters.assayData(this.assay)?.filteredData?.peptideCountTable;
    }

    private created() {
        this.isComputing = true;
        this.computedItems = [];

        // @ts-ignore
        for (const namespace of Object.values(GoNamespace).map(x => x.toString()).sort()) {
            const goCountTable = this.goCountTableProcessor.getCountTable(namespace as FunctionalNamespace);

            const itemRetriever = new MultiAmountTableItemRetriever(
                goCountTable,
                this.peptideCountTable,
                this.goOntology
            );

            this.computedItems.push({
                itemRetriever: itemRetriever,
                definitions: goCountTable.getOntologyIds().map(id => this.goOntology.getDefinition(id)),
                namespace: namespace
            });

            const trust = this.goCountTableProcessor.getTrust();
            this.trustLine = FunctionalUtils.computeTrustLine(trust, "GO-term", "peptide");
        }

        this.isComputing = false;
    }


    // @Watch("goCountTableProcessor")
    // @Watch("peptideCountTable")
    // @Watch("goOntology")
    // @Watch("filterPercentage")
    // private async onInputsChanged() {
    //     this.isComputing = true;
    //
    //     for (const item of this.computedItems) {
    //         item.itemRetriever = null;
    //     }
    //
    //     if (this.peptideCountTable && this.goCountTableProcessor && this.goOntology) {
    //         // @ts-ignore
    //         for (const [idx, namespace] of Object.values(GoNamespace).map(x => x.toString()).sort().entries()) {
    //             let goCountTable: CountTable<GoCode>;
    //             let trust: FunctionalTrust;
    //
    //             if (this.filterPercentage === FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE) {
    //                 goCountTable = await this.goCountTableProcessor.getCountTable(namespace as FunctionalNamespace);
    //                 this.itemsToPeptides = await this.goCountTableProcessor.getAnnotationPeptideMapping();
    //                 trust = await this.goCountTableProcessor.getTrust();
    //             } else {
    //                 const goProcessor = new GoCountTableProcessor(
    //                     this.peptideCountTable,
    //                     this.assay.getSearchConfiguration(),
    //                     this.pept2data,
    //                     this.communicationSource.getGoCommunicator(),
    //                     this.filterPercentage
    //                 );
    //
    //                 goCountTable = await goProcessor.getCountTable(namespace as FunctionalNamespace);
    //                 this.itemsToPeptides = await goProcessor.getAnnotationPeptideMapping();
    //                 trust = await this.goCountTableProcessor.getTrust();
    //             }
    //
    //             const itemRetriever = new MultiAmountTableItemRetriever(
    //                 goCountTable,
    //                 this.peptideCountTable,
    //                 this.goOntology
    //             );
    //
    //             const currentObj = this.computedItems[idx];
    //             currentObj.itemRetriever = itemRetriever;
    //             currentObj.definitions.splice(0, currentObj.definitions.length);
    //             currentObj.definitions.push(
    //                 ...goCountTable.getOntologyIds().map(id => this.goOntology.getDefinition(id))
    //             );
    //
    //             this.trustLine = FunctionalUtils.computeTrustLine(trust, "GO-term", "peptide");
    //         }
    //     }
    //
    //     this.isComputing = false;
    // }

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
            this.pept2data,
            this.ncbiOntology,
            (peptideData: PeptideData) => peptideData.go
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
