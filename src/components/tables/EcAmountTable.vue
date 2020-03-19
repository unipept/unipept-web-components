<template>
    <amount-table
        :loading="isLoading"
        annotation-name="EC number"
        :items="items"
        :search-configuration="searchConfiguration"
        :item-to-peptides-mapping="ecPeptideMapping">
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
    @Prop({ required: false })
    private ecPeptideMapping: Map<EcCode, Peptide[]>;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: false })
    private searchConfiguration: SearchConfiguration;
    /**
     * Display the counts from the given count table as an absolute value, or as a relative value? If this value is
     * set to 0, the absolute counts are displayed. If the value is set to a number n (different from 0), the
     * relative values will be shown (by dividing every count by x).
     */
    @Prop({ required: false, default: 0 })
    private relativeCounts: number;

    private items: TableItem[] = [];
    private computeInProgress: boolean = false;

    public async mounted() {
        await this.onInputsChanged();
    }

    @Watch("ecCountTable")
    @Watch("relativeCounts")
    public async onInputsChanged() {
        if (this.ecCountTable) {
            this.computeInProgress = true;

            const newItems = this.ecCountTable.getOntologyIds().map(ecCode => {
                const definition: EcDefinition = this.ecOntology.getDefinition(ecCode);
                const currentCount = this.ecCountTable.getCounts(ecCode);

                return new TableItem(
                    this.relativeCounts == 0 ? currentCount: currentCount / this.relativeCounts,
                    definition.name,
                    definition.code,
                    definition
                );
            });

            this.items.length = 0;
            this.items.push(...newItems);

            this.computeInProgress = false;
        }
    }
}
</script>

<style scoped>
</style>
