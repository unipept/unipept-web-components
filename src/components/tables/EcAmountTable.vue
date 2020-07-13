<template>
    <amount-table
        :loading="ecCountTableProcessor === undefined"
        annotation-name="EC number"
        :items="items"
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

    @Watch("ncbiCountTableProcessor")
    private async onNcbiCountTableProcessorChanged() {
        if (this.ncbiCountTableProcessor) {
            this.taxaToPeptidesMapping = await this.ncbiCountTableProcessor.getAnnotationPeptideMapping();
        }
    }

    @Watch("ecCountTableProcessor")
    @Watch("ecOntology")
    @Watch("peptideCountTable")
    public async onInputsChanged() {
        this.computeInProgress = true;
        this.items.splice(0, this.items.length);

        if (this.peptideCountTable && this.ecOntology && this.ecCountTableProcessor) {
            const newItems: TableItem[] = [];
            this.itemsToPeptidesMapping = await this.ecCountTableProcessor.getAnnotationPeptideMapping();

            const ecCountTable = await this.ecCountTableProcessor.getCountTable();

            for (const ecCode of ecCountTable.getOntologyIds()) {
                const definition: EcDefinition = this.ecOntology.getDefinition(ecCode);
                const currentCount = ecCountTable.getCounts(ecCode);

                if (definition) {
                    newItems.push(new TableItem(
                        currentCount,
                        currentCount / this.peptideCountTable.totalCount,
                        definition.name,
                        definition.code,
                        definition
                    ));
                }
            }

            this.items.push(...newItems.filter(i => i).sort((a: TableItem, b: TableItem) => b.count - a.count));

            this.computeInProgress = false;
        }
    }

    private getUrl(code: string): string {
        return `https://www.uniprot.org/uniprot/?query=${code}`
    }
}
</script>

<style scoped>
</style>
