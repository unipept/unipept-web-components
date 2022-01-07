<template>
    <v-card flat>
        <v-card-text>
            <div v-if="!isComputing">
                <filter-functional-annotations-dropdown v-model="percentSettings">
                </filter-functional-annotations-dropdown>
                <span>This panel shows the Interpro entries that were matched to your peptides. </span>
                <span v-html="trustLine"></span>
                <span>Click on a row in the table to see a taxonomy tree that highlights occurrences.</span>
            </div>
            <v-select :items="namespaceValues" label="Category" v-model="selectedNamespace"></v-select>
            <amount-table
                annotation-name="InterPro-entry"
                :item-retriever="getSelectedItemRetriever()"
                :external-url-constructor="getUrl"
                :loading="isComputing"
                :items-to-peptides="itemsToPeptides"
                :taxa-to-peptides="taxaToPeptides"
                :tree="tree"
                :item-to-csv-summary="saveSummaryAsCsv"
                :show-percentage="showPercentage"
                :rows-per-page="10"
                :show-namespace="true">
            </amount-table>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import FilterFunctionalAnnotationsDropdown from "./../functional/FilterFunctionalAnnotationsDropdown.vue";
import { Prop, Watch } from "vue-property-decorator";
import InterproCountTableProcessor from "./../../../business/processors/functional/interpro/InterproCountTableProcessor";
import { FunctionalUtils } from "./../../../components/analysis/functional/FunctionalUtils";
import ProteomicsAssay from "./../../../business/entities/assay/ProteomicsAssay";
import {
    CountTable,
    CsvUtils,
    FunctionalCountTableProcessor, FunctionalNamespace,
    FunctionalSummaryProcessor, GoCode,
    InterproCode,
    InterproDefinition, InterproNamespace,
    NcbiId,
    NcbiOntologyProcessor, NcbiTaxon,
    NetworkUtils,
    Ontology,
    Pept2DataCommunicator,
    Peptide,
    PeptideCountTableProcessor, PeptideData,
    Tree
} from "@/business";
import LcaCountTableProcessor from "@/business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import CommunicationSource from "@/business/communication/source/CommunicationSource";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import MultiAmountTableItemRetriever from "@/components/analysis/multi/MultiAmountTableItemRetriever";
import AmountTable from "@/components/tables/AmountTable.vue";
import { convertStringToInterproNamespace } from "@/business/ontology/functional/interpro/InterproNamespace";
import { ShareableMap } from "shared-memory-datastructures";

@Component({
    components: { FilterFunctionalAnnotationsDropdown, AmountTable }
})
export default class MultiInterproSummaryCard extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: true })
    private showPercentage: boolean;

    private computedItems: {
        itemRetriever: AmountTableItemRetriever<InterproCode, InterproDefinition>;
        namespace: string
    }[] = [];

    // @ts-ignore
    private namespaceValues: string[] = ["all"].concat(Object.values(InterproNamespace).map(x => x.toString()).sort());
    private selectedNamespace: string = "all";

    private trustLine: string = "";
    private isComputing: boolean = false;
    private percentSettings: string = "5";

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

    get interproCountTableProcessor(): InterproCountTableProcessor {
        return this.$store.getters.assayData(this.assay)?.originalData?.interproCountTableProcessor;
    }

    get interproOntology(): Ontology<InterproCode, InterproDefinition> {
        return this.$store.getters.assayData(this.assay)?.interproOntology;
    }

    get itemsToPeptides(): Map<InterproCode, Peptide[]> {
        return this.interproCountTableProcessor.getAnnotationPeptideMapping();
    }

    get tree(): Tree {
        return this.$store.getters.assayData(this.assay)?.originalData?.tree;
    }

    get peptideCountTable(): CountTable<Peptide> {
        return this.$store.getters.assayData(this.assay)?.filteredData?.peptideCountTable;
    }

    private created() {
        this.isComputing = true;

        for (const namespace of this.namespaceValues) {
            const functionalCountTable = this.interproCountTableProcessor.getCountTable(
                namespace === "all" ? undefined : convertStringToInterproNamespace(namespace)
            );

            const itemRetriever = new MultiAmountTableItemRetriever(
                functionalCountTable,
                this.peptideCountTable,
                this.interproOntology
            )

            this.computedItems.push({
                itemRetriever: itemRetriever,
                namespace: namespace
            });
        }

        this.trustLine = FunctionalUtils.computeTrustLine(
            this.interproCountTableProcessor.getTrust(),
            "InterPro-entry",
            "peptide"
        );

        this.isComputing = false;
    }

    // @Watch("interproCountTableProcessor")
    // @Watch("peptideCountTable")
    // @Watch("interproOntology")
    // @Watch("filterPercentage")
    // public async recompute(): Promise<void> {
    //     this.isComputing = true;
    //
    //     if (this.peptideCountTable && this.interproCountTableProcessor && this.interproOntology) {
    //         this.trustLine = FunctionalUtils.computeTrustLine(
    //             await this.interproCountTableProcessor.getTrust(),
    //             "InterPro-entry",
    //             "peptide"
    //         );
    //
    //         for (const [idx, namespace] of this.namespaceValues.entries()) {
    //             let iprCountTable: CountTable<InterproCode>;
    //
    //             if (this.filterPercentage === FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE) {
    //                 iprCountTable = await this.interproCountTableProcessor.getCountTable(
    //                     namespace === "all" ? undefined : convertStringToInterproNamespace(namespace)
    //                 );
    //                 this.itemsToPeptides = await this.interproCountTableProcessor.getAnnotationPeptideMapping();
    //             } else {
    //                 const iprProcessor = new InterproCountTableProcessor(
    //                     this.peptideCountTable,
    //                     this.assay.getSearchConfiguration(),
    //                     this.pept2data,
    //                     this.communicationSource.getInterproCommunicator(),
    //                     this.filterPercentage
    //                 );
    //
    //                 iprCountTable = await iprProcessor.getCountTable(
    //                     namespace === "all" ? undefined : convertStringToInterproNamespace(namespace)
    //                 );
    //                 this.itemsToPeptides = await iprProcessor.getAnnotationPeptideMapping();
    //             }
    //
    //             const itemRetriever = new MultiAmountTableItemRetriever(
    //                 iprCountTable,
    //                 this.peptideCountTable,
    //                 this.interproOntology
    //             );
    //
    //             const currentObj = this.computedItems[idx];
    //             currentObj.itemRetriever = itemRetriever;
    //         }
    //     }
    //
    //     this.isComputing = false;
    // }

    private getSelectedItemRetriever(): AmountTableItemRetriever<InterproCode, InterproDefinition> {
        return this.computedItems.filter(i => i.namespace === this.selectedNamespace)[0].itemRetriever;
    }

    private async saveSummaryAsCsv(code: InterproCode): Promise<void> {
        const peptideTableProcessor = new PeptideCountTableProcessor();
        const peptideCounts = await peptideTableProcessor.getPeptideCountTable(
            this.itemsToPeptides.get(code),
            this.assay.getSearchConfiguration()
        );

        const functionalSummaryProcessor = new FunctionalSummaryProcessor();
        const data = await functionalSummaryProcessor.summarizeFunctionalAnnotation(
            this.interproOntology.getDefinition(code),
            peptideCounts,
            this.pept2data,
            this.ncbiOntology
        );

        await NetworkUtils.downloadDataByForm(
            CsvUtils.toCsvString(data),
            code.replace(/:/g, "_") + ".csv",
            "text/csv"
        );
    }

    private getUrl(code: string): string {
        return `https://www.ebi.ac.uk/interpro/search/text/${code.substr(4)}/#table`;
    }
}
</script>

<style scoped>

</style>
