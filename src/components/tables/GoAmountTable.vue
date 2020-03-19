<template>
    <amount-table
        :items="items"
        :loading="isLoading"
        annotation-name="GO term"
        :namespace="namespace"
        :search-configuration="searchConfiguration"
        :item-to-peptides-mapping="goPeptideMapping">
    </amount-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { tooltipContent } from "../../components/visualizations/VisualizationHelper";
import Treeview from "../visualizations/treeview.vue";
import AmountTable from "./AmountTable.vue";
import GoDefinition, { GoCode } from "./../../business/ontology/functional/go/GoDefinition";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import TableItem from "./../tables/TableItem";
import GoOntologyProcessor from "./../../business/ontology/functional/go/GoOntologyProcessor";
import { Ontology } from "./../../business/ontology/Ontology";

@Component({
    components: {
        AmountTable
    },
    computed: {
        isLoading: {
            get(): boolean {
                return this.loading || this.isComputing;
            }
        }
    }
})
export default class GoAmountTable extends Vue {
    @Prop({ required: true })
    private goCountTable: CountTable<GoCode>;
    @Prop({ required: true })
    private goOntology: Ontology<GoCode, GoDefinition>;
    @Prop({ required: false })
    private goPeptideMapping: Map<GoCode, Peptide[]>;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: false })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: false })
    private namespace: string;
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

    @Watch("goCountTable")
    @Watch("relativeCounts")
    @Watch("goOntology")
    private async onInputsChanged() {
        this.isComputing = true;

        if (this.goCountTable && this.goOntology) {
            const newItems = this.goCountTable.getOntologyIds().map(goCode => {
                const definition: GoDefinition = this.goOntology.getDefinition(goCode);
                const currentCount = this.goCountTable.getCounts(goCode);

                return new TableItem(
                    this.relativeCounts === 0 ? currentCount : currentCount / this.relativeCounts,
                    definition.name,
                    definition.code,
                    definition
                );
            });
        }

        this.isComputing = false;
    }
}
</script>

<style scoped>
</style>
