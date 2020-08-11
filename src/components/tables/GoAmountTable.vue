<template>
    <amount-table
        :item-retriever="itemRetriever"
        :assay="assay"
        :loading="goCountTableProcessor === undefined || isComputing"
        annotation-name="GO term"
        :namespace="namespace"
        :item-to-peptides-mapping="itemsToPeptidesMapping"
        :taxa-to-peptides-mapping="taxaToPeptidesMapping"
        :show-percentage="showPercentage"
        :tree="tree"
        :external-url-constructor="getUrl">
    </amount-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import AmountTable from "./AmountTable.vue";
import GoDefinition, { GoCode } from "./../../business/ontology/functional/go/GoDefinition";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import TableItem from "./../tables/TableItem";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";
import { GoNamespace } from "./../../business/ontology/functional/go/GoNamespace";
import { Ontology } from "./../../business/ontology/Ontology";
import GoCountTableProcessor from "./../../business/processors/functional/go/GoCountTableProcessor";
import Tree from "./../../business/ontology/taxonomic/Tree";
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import LcaCountTableProcessor from "./../../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import FunctionalItemRetriever from "./FunctionalItemRetriever";
import FunctionalCountTableProcessor from "./../../business/processors/functional/FunctionalCountTableProcessor";
import CommunicationSource from "./../../business/communication/source/CommunicationSource";

@Component({
    components: {
        AmountTable
    }
})
export default class GoAmountTable extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: true })
    private namespace: GoNamespace;
    /**
     * Whether the counts in the amount table should be displayed as absolute or relative (percentage) values.
     */
    @Prop({ required: false, default: false })
    private showPercentage: boolean;

    private isComputing: boolean = false;
    private itemsToPeptidesMapping: Map<GoCode, Peptide[]> = null;
    private taxaToPeptidesMapping: Map<NcbiId, Peptide[]> = null;
    private itemRetriever: FunctionalItemRetriever<GoCode, GoDefinition> = null;

    public async mounted() {
        await this.onInputsChanged();
        await this.onNcbiCountTableChanged();
    }

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

    @Watch("ncbiCountTableProcessor")
    private async onNcbiCountTableChanged() {
        if (this.ncbiCountTableProcessor) {
            this.taxaToPeptidesMapping = await this.ncbiCountTableProcessor.getAnnotationPeptideMapping();
        }
    }

    @Watch("goCountTableProcessor")
    @Watch("peptideCountTable")
    @Watch("goOntology")
    @Watch("filterPercentage")
    private async onInputsChanged() {
        this.isComputing = true;
        this.itemRetriever = null;

        if (this.peptideCountTable && this.goCountTableProcessor && this.goOntology) {
            let goCountTable: CountTable<GoCode>;

            if (this.filterPercentage === FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE) {
                goCountTable = await this.goCountTableProcessor.getCountTable(this.namespace);
                this.itemsToPeptidesMapping = await this.goCountTableProcessor.getAnnotationPeptideMapping();
            } else {
                const goProcessor = new GoCountTableProcessor(
                    this.peptideCountTable,
                    this.assay.getSearchConfiguration(),
                    this.communicationSource,
                    this.filterPercentage
                );

                goCountTable = await goProcessor.getCountTable(this.namespace);
                this.itemsToPeptidesMapping = await goProcessor.getAnnotationPeptideMapping();
            }

            this.itemRetriever = new FunctionalItemRetriever(
                goCountTable,
                this.peptideCountTable,
                this.goOntology
            );
        }

        this.isComputing = false;
    }

    private getUrl(code: string): string {
        return `http://amigo.geneontology.org/amigo/search/ontology?q=${code}`;
    }
}
</script>

<style scoped>
</style>
