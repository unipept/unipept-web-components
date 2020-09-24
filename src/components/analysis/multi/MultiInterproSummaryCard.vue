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
                :loading="isComputing || interproOntology === undefined || interproCountTableProcessor === undefined"
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
    FunctionalCountTableProcessor,
    FunctionalSummaryProcessor,
    InterproCode,
    InterproDefinition, InterproNamespace,
    NcbiId,
    NcbiOntologyProcessor,
    NetworkUtils,
    Ontology,
    Pept2DataCommunicator,
    Peptide,
    PeptideCountTableProcessor,
    Tree
} from "@/business";
import LcaCountTableProcessor from "@/business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import CommunicationSource from "@/business/communication/source/CommunicationSource";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import MultiAmountTableItemRetriever from "@/components/analysis/multi/MultiAmountTableItemRetriever";
import AmountTable from "@/components/tables/AmountTable.vue";
import { convertStringToInterproNamespace } from "@/business/ontology/functional/interpro/InterproNamespace";

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

    private itemsToPeptides: Map<InterproCode, Peptide[]>;
    private taxaToPeptides: Map<NcbiId, Peptide[]>;

    private namespaceValues: string[] = ["all"].concat(Object.values(InterproNamespace).sort());
    private selectedNamespace: string = "all";

    private trustLine: string = "";
    private isComputing: boolean = false;
    private percentSettings: string = "5";

    get interproCountTableProcessor(): InterproCountTableProcessor {
        return this.$store.getters["interpro/filteredData"](this.assay)?.processor;
    }

    get peptideCountTable(): CountTable<Peptide> {
        return this.$store.getters.assayData(this.assay)?.filteredPeptideCountTable;
    }

    get interproOntology(): Ontology<InterproCode, InterproDefinition> {
        return this.$store.getters["interpro/ontology"](this.assay);
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

    private created() {
        for (const namespace of this.namespaceValues) {
            this.computedItems.push({
                itemRetriever: undefined,
                namespace: namespace
            });
        }
        this.onNcbiCountTableChanged();
        this.recompute();
    }

    @Watch("ncbiCountTableProcessor")
    private async onNcbiCountTableChanged() {
        if (this.ncbiCountTableProcessor) {
            this.taxaToPeptides = await this.ncbiCountTableProcessor.getAnnotationPeptideMapping();
        }
    }

    @Watch("interproCountTableProcessor")
    @Watch("peptideCountTable")
    @Watch("interproOntology")
    @Watch("filterPercentage")
    public async recompute(): Promise<void> {
        this.isComputing = true;

        if (this.peptideCountTable && this.interproCountTableProcessor && this.interproOntology) {
            this.trustLine = FunctionalUtils.computeTrustLine(
                await this.interproCountTableProcessor.getTrust(),
                "InterPro-entry",
                "peptide"
            );

            for (const [idx, namespace] of this.namespaceValues.entries()) {
                let iprCountTable: CountTable<InterproCode>;

                if (this.filterPercentage === FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE) {
                    iprCountTable = await this.interproCountTableProcessor.getCountTable(
                        namespace === "all" ? undefined : convertStringToInterproNamespace(namespace)
                    );
                    this.itemsToPeptides = await this.interproCountTableProcessor.getAnnotationPeptideMapping();
                } else {
                    const iprProcessor = new InterproCountTableProcessor(
                        this.peptideCountTable,
                        this.assay.getSearchConfiguration(),
                        this.communicationSource,
                        this.filterPercentage
                    );

                    iprCountTable = await iprProcessor.getCountTable(
                        namespace === "all" ? undefined : convertStringToInterproNamespace(namespace)
                    );
                    this.itemsToPeptides = await iprProcessor.getAnnotationPeptideMapping();
                }

                const itemRetriever = new MultiAmountTableItemRetriever(
                    iprCountTable,
                    this.peptideCountTable,
                    this.interproOntology
                );

                const currentObj = this.computedItems[idx];
                currentObj.itemRetriever = itemRetriever;
            }
        }

        this.isComputing = false;
    }

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

    private getUrl(code: string): string {
        return `https://www.ebi.ac.uk/interpro/search/text/${code.substr(4)}/#table`;
    }
}
</script>

<style scoped>

</style>
