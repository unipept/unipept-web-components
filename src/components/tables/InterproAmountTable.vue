<template>
    <amount-table
        :items="items"
        :loading="isLoading"
        annotation-name="Entry"
        :search-configuration="searchConfiguration"
        :item-to-peptides-mapping="interproPeptideMapping">
    </amount-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { tooltipContent } from "../../components/visualizations/VisualizationHelper";
import InterproDefinition, { InterproCode } from "./../../business/ontology/functional/interpro/InterproDefinition";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import AmountTable from "./../tables/AmountTable.vue";
import TableItem from "./../tables/TableItem";
import InterproOntologyProcessor from "./../../business/ontology/functional/interpro/InterproOntologyProcessor";
import { Ontology } from "./../../business/ontology/Ontology";

@Component({
    components: {
        AmountTable
    },
    computed: {
        isLoading: {
            get(): boolean {
                return this.isComputing || this.loading;
            }
        }
    }
})
export default class GoAmountTable extends Vue {
    @Prop({ required: true })
    private interproCountTable: CountTable<InterproCode>;
    @Prop({ required: true })
    private interproOntology: Ontology<InterproCode, InterproDefinition>;
    @Prop({ required: false })
    private interproPeptideMapping: Map<InterproCode, Peptide[]>;
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
    private isComputing: boolean = false;

    public async mounted() {
        await this.onInputsChanged();
    }

    @Watch("interproCountTable")
    @Watch("relativeCounts")
    private async onInputsChanged() {
        this.isComputing = true;

        const newItems = this.interproCountTable.getOntologyIds().map(interproCode => {
            const interproDefinition = this.interproOntology.getDefinition(interproCode);
            const currentCounts = this.interproCountTable.getCounts(interproCode);

            return new TableItem(
                this.relativeCounts === 0 ? currentCounts : currentCounts / this.relativeCounts,
                interproDefinition.name,
                interproDefinition.code,
                interproDefinition
            );
        });

        this.items.length = 0;
        this.items.push(...newItems);

        this.isComputing = false;
    }
}
</script>

<style scoped>
</style>
