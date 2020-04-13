<template>
    <amount-table
        :loading="isLoading"
        annotation-name="EC number"
        :items="items"
        :search-configuration="searchConfiguration"
        :item-to-peptides-mapping="ecPeptideMapping"
        :tree="tree"
        :taxa-to-peptides-mapping="taxaToPeptidesMapping"
        :show-percentage="showPercentage">
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
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import TableItem from "./../tables/TableItem";
import EcOntologyProcessor from "./../../business/ontology/functional/ec/EcOntologyProcessor";
import { Ontology } from "./../../business/ontology/Ontology";
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../business/ontology/taxonomic/Tree";

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
    private ecCountTable: CountTable<EcCode>;
    @Prop({ required: true })
    private ecOntology: Ontology<EcCode, EcDefinition>;
    /**
     * Display the counts from the given count table as an absolute value, or as a relative value? If this value is
     * set to 0, the absolute counts are displayed. If the value is set to a number n (different from 0), the
     * relative values will be shown (by dividing every count by x).
     */
    @Prop({ required: true })
    private relativeCounts: number;

    @Prop({ required: false })
    private ecPeptideMapping: Map<EcCode, Peptide[]>;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: false })
    private searchConfiguration: SearchConfiguration;
    /**
     * Whether the counts in the amount table should be displayed as absolute or relative (percentage) values.
     */
    @Prop({ required: false, default: false })
    private showPercentage: boolean;
    @Prop({ required: false })
    protected taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;
    @Prop({ required: false })
    protected tree: Tree;

    private items: TableItem[] = [];
    private computeInProgress: boolean = false;

    public async mounted() {
        await this.onInputsChanged();
    }

    @Watch("ecCountTable")
    @Watch("ecOntology")
    @Watch("relativeCounts")
    public async onInputsChanged() {
        if (this.ecCountTable && this.ecOntology) {
            this.computeInProgress = true;

            const newItems = this.ecCountTable.getOntologyIds().map(ecCode => {
                const definition: EcDefinition = this.ecOntology.getDefinition(ecCode);
                const currentCount = this.ecCountTable.getCounts(ecCode);

                if (definition) {
                    return new TableItem(
                        currentCount,
                        currentCount / this.relativeCounts,
                        definition.name,
                        definition.code,
                        definition
                    );
                }
            });

            this.items.length = 0;
            this.items.push(...newItems.filter(i => i).sort((a: TableItem, b: TableItem) => b.count - a.count));

            this.computeInProgress = false;
        }
    }
}
</script>

<style scoped>
</style>
