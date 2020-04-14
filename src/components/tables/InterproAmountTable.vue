<template>
    <amount-table
        :items="items"
        :loading="isLoading"
        :rows-per-page="10"
        annotation-name="Interpro entry"
        :search-configuration="searchConfiguration"
        :item-to-peptides-mapping="interproPeptideMapping"
        :show-percentage="showPercentage"
        :tree="tree"
        :taxa-to-peptides-mapping="taxaToPeptidesMapping">
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
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../business/ontology/taxonomic/Tree";

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
    /**
     * Display the counts from the given count table as an absolute value, or as a relative value? If this value is
     * set to 0, the absolute counts are displayed. If the value is set to a number n (different from 0), the
     * relative values will be shown (by dividing every count by x).
     */
    @Prop({ required: true })
    private relativeCounts: number;

    @Prop({ required: false })
    private interproPeptideMapping: Map<InterproCode, Peptide[]>;
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
    private isComputing: boolean = false;

    public async mounted() {
        await this.onInputsChanged();
    }

    @Watch("interproCountTable")
    @Watch("interproOntology")
    @Watch("relativeCounts")
    private async onInputsChanged() {
        this.isComputing = true;

        if (this.interproCountTable && this.interproOntology) {
            const newItems: TableItem[] = [];
            for (const interproCode of this.interproCountTable.getOntologyIds()) {
                const definition: InterproDefinition = this.interproOntology.getDefinition(interproCode);
                const currentCount = this.interproCountTable.getCounts(interproCode);

                if (definition) {
                    newItems.push(new TableItem(
                        currentCount,
                        currentCount / this.relativeCounts,
                        definition.name,
                        definition.code,
                        definition
                    ));
                }
            }

            this.items.length = 0;
            this.items.push(...newItems.sort((a: TableItem, b: TableItem) => b.count - a.count));
        }

        this.isComputing = false;
    }
}
</script>

<style scoped>
</style>
