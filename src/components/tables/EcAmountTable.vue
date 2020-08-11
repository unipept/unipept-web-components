<template>
    <amount-table
        :loading="ecCountTableProcessor === undefined || computeInProgress"
        annotation-name="EC number"
        :item-retriever="itemRetriever"
        :assay="assay"
        :item-to-peptides-mapping="itemsToPeptidesMapping"
        :tree="tree"
        :taxa-to-peptides-mapping="taxaToPeptidesMapping"
        :show-percentage="showPercentage"
        :external-url-constructor="getUrl">
    </amount-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import AmountTable from "./AmountTable.vue";
import EcDefinition, { EcCode } from "./../../business/ontology/functional/ec/EcDefinition";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import TableItem from "./../tables/TableItem";
import { Ontology } from "./../../business/ontology/Ontology";
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../business/ontology/taxonomic/Tree";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";
import LcaCountTableProcessor from "./../../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import EcCountTableProcessor from "./../../business/processors/functional/ec/EcCountTableProcessor";
import FunctionalItemRetriever from "./FunctionalItemRetriever";
import CommunicationSource from "./../../business/communication/source/CommunicationSource";
import FunctionalCountTableProcessor from "./../../business/processors/functional/FunctionalCountTableProcessor";

@Component({
    components: {
        AmountTable
    },
    computed: {
        isLoading: {
            get(): boolean {
                return this.computeInProgress || this.loading;
            }
        }
    }
})
export default class EcAmountTable extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    /**
     * Whether the counts in the amount table should be displayed as absolute or relative (percentage) values.
     */
    @Prop({ required: false, default: false })
    private showPercentage: boolean;

    private items: TableItem[] = [];
    private computeInProgress: boolean = false;
    private itemsToPeptidesMapping: Map<EcCode, Peptide[]> = null;
    private taxaToPeptidesMapping: Map<NcbiId, Peptide[]> = null;
    private itemRetriever: FunctionalItemRetriever<EcCode, EcDefinition> = null;

    public async mounted() {
        await this.onInputsChanged();
        await this.onNcbiCountTableProcessorChanged();
    }

    get peptideCountTable(): CountTable<Peptide> {
        return this.$store.getters.assayData(this.assay)?.filteredPeptideCountTable;
    }

    get ecCountTableProcessor(): EcCountTableProcessor {
        return this.$store.getters["ec/filteredData"](this.assay)?.processor;
    }

    get ecOntology(): Ontology<EcCode, EcDefinition> {
        return this.$store.getters["ec/ontology"](this.assay);
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
    private async onNcbiCountTableProcessorChanged() {
        if (this.ncbiCountTableProcessor) {
            this.taxaToPeptidesMapping = await this.ncbiCountTableProcessor.getAnnotationPeptideMapping();
        }
    }

    @Watch("ecCountTableProcessor")
    @Watch("ecOntology")
    @Watch("peptideCountTable")
    @Watch("filterPercentage")
    public async onInputsChanged() {
        this.computeInProgress = true;
        this.itemRetriever = null;

        if (this.peptideCountTable && this.ecCountTableProcessor && this.ecOntology) {
            let ecCountTable: CountTable<EcCode>;

            if (this.filterPercentage === FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE) {
                ecCountTable = await this.ecCountTableProcessor.getCountTable();
                this.itemsToPeptidesMapping = await this.ecCountTableProcessor.getAnnotationPeptideMapping();
            } else {
                const ecProcessor = new EcCountTableProcessor(
                    this.peptideCountTable,
                    this.assay.getSearchConfiguration(),
                    this.communicationSource,
                    this.filterPercentage
                );

                ecCountTable = await ecProcessor.getCountTable();
                this.itemsToPeptidesMapping = await ecProcessor.getAnnotationPeptideMapping();
            }
            this.itemRetriever = new FunctionalItemRetriever(
                ecCountTable,
                this.peptideCountTable,
                this.ecOntology
            );
        }

        this.computeInProgress = false;
    }

    private getUrl(code: string): string {
        return `https://www.uniprot.org/uniprot/?query=${code}`
    }
}
</script>

<style scoped>
</style>
