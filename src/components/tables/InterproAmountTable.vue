<template>
    <amount-table
        :assay="assay"
        :item-retriever="itemRetriever"
        :loading="interproCountTableProcessor === undefined || isComputing"
        :rows-per-page="10"
        annotation-name="Interpro entry"
        :item-to-peptides-mapping="itemsToPeptidesMapping"
        :show-percentage="showPercentage"
        :taxa-to-peptides-mapping="taxaToPeptidesMapping"
        :external-url-constructor="getUrl"
        :show-namespace="true"
        :tree="tree">
    </amount-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import InterproDefinition, { InterproCode } from "./../../business/ontology/functional/interpro/InterproDefinition";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import AmountTable from "./../tables/AmountTable.vue";
import TableItem from "./../tables/TableItem";
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";
import { CountTable } from "./../../business/counts/CountTable";
import InterproCountTableProcessor from "./../../business/processors/functional/interpro/InterproCountTableProcessor";
import { Ontology } from "./../../business/ontology/Ontology";
import LcaCountTableProcessor from "./../../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import { InterproNamespace } from "./../../business/ontology/functional/interpro/InterproNamespace";
import Tree from "./../../business/ontology/taxonomic/Tree";
import FunctionalItemRetriever from "./FunctionalItemRetriever";
import CommunicationSource from "./../../business/communication/source/CommunicationSource";
import FunctionalCountTableProcessor from "./../../business/processors/functional/FunctionalCountTableProcessor";

@Component({
    components: {
        AmountTable
    }
})
export default class InterproAmountTable extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: false, default: null })
    private namespace: InterproNamespace;
    /**
     * Whether the counts in the amount table should be displayed as absolute or relative (percentage) values.
     */
    @Prop({ required: false, default: false })
    private showPercentage: boolean;

    private isComputing: boolean = false;
    private taxaToPeptidesMapping: Map<NcbiId, Peptide[]> = null;
    private itemsToPeptidesMapping: Map<InterproCode, Peptide[]> = null;
    private itemRetriever: FunctionalItemRetriever<InterproCode, InterproDefinition> = null;

    public async mounted() {
        await this.onInputsChanged();
        await this.onNcbiCountTableProcessorChanged();
    }

    get peptideCountTable(): CountTable<Peptide> {
        return this.$store.getters.assayData(this.assay)?.filteredPeptideCountTable;
    }

    get interproCountTableProcessor(): InterproCountTableProcessor {
        return this.$store.getters["interpro/filteredData"](this.assay)?.processor;
    }

    get interproOntology(): Ontology<InterproCode, InterproDefinition> {
        return this.$store.getters["interpro/ontology"](this.assay);
    }

    get ncbiCountTableProcessor(): LcaCountTableProcessor {
        return this.$store.getters["ncbi/originalData"](this.assay)?.processor;
    }

    get tree(): Tree {
        return this.$store.getters["ncbi/tree"](this.assay);
    }

    get filterPercentage(): number {
        return this.$store.getters.assayData(this.assay)?.filterPercentage;
    }

    get communicationSource(): CommunicationSource {
        return this.$store.getters.assayData(this.assay)?.communicationSource;
    }

    @Watch("ncbiCountTableProcessor")
    private async onNcbiCountTableProcessorChanged() {
        if (this.ncbiCountTableProcessor) {
            this.taxaToPeptidesMapping = await this.ncbiCountTableProcessor.getAnnotationPeptideMapping();
        }
    }

    @Watch("namespace")
    @Watch("interproCountTableProcessor")
    @Watch("interproOntology")
    @Watch("peptideCountTable")
    @Watch("filterPercentage")
    private async onInputsChanged() {
        this.isComputing = true;
        this.itemRetriever = null;

        if (this.peptideCountTable && this.interproCountTableProcessor && this.interproOntology) {
            let interproTable: CountTable<InterproCode>;

            if (this.filterPercentage === FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE) {
                interproTable = await this.interproCountTableProcessor.getCountTable();
                this.itemsToPeptidesMapping = await this.interproCountTableProcessor.getAnnotationPeptideMapping();
            } else {
                const interproProcessor = new InterproCountTableProcessor(
                    this.peptideCountTable,
                    this.assay.getSearchConfiguration(),
                    this.communicationSource,
                    this.filterPercentage
                );
                interproTable = await interproProcessor.getCountTable();
                this.itemsToPeptidesMapping = await interproProcessor.getAnnotationPeptideMapping();
            }

            this.itemRetriever = new FunctionalItemRetriever(
                interproTable,
                this.peptideCountTable,
                this.interproOntology
            );
        }

        this.isComputing = false;
    }

    private getUrl(code: string): string {
        return `https://www.ebi.ac.uk/interpro/search/text/${code.substr(4)}/#table`;
    }
}
</script>

<style scoped>
</style>
