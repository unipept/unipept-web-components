<template>
    <amount-table
        :items="items"
        :loading="loading"
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

@Component({
    components: {
        AmountTable
    }
})
export default class GoAmountTable extends Vue {
    @Prop({ required: true })
    private goCountTable: CountTable<GoCode>;
    @Prop({ required: false })
    private goPeptideMapping: Map<GoCode, Peptide[]>;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: false })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: false })
    private namespace: string;

    private items: TableItem[] = [];

    public async mounted() {
        await this.onCountTableChanged();
    }

    @Watch("goCountTable")
    private async onCountTableChanged() {
        this.loading = true;

        const goOntologyProcessor = new GoOntologyProcessor();
        const goOntology = await goOntologyProcessor.getOntology(this.goCountTable);
        const newItems = this.goCountTable.getOntologyIds().map(goCode => {
            const definition: GoDefinition = goOntology.getDefinition(goCode);

            return new TableItem(
                this.goCountTable.getCounts(goCode),
                definition.name,
                definition.code,
                definition
            );
        });

        this.loading = false;
    }
}
</script>

<style scoped>
</style>
