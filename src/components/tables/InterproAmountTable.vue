<template>
    <amount-table
        :items="items"
        :loading="loading"
        annotation-name="Entry"
        :searchSettings="searchSettings"
        :taxaRetriever="taxaRetriever"
        :summaryRetriever="summaryRetriever">
    </amount-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { tooltipContent } from "../../components/visualizations/VisualizationHelper";
import { InterproCode } from "@/business/ontology/functional/interpro/InterproDefinition";
import { CountTable } from "@/business/counts/CountTable";
import { Peptide } from "@/business/ontology/raw/Peptide";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import AmountTable from "@/components/tables/AmountTable.vue";
import TableItem from "@/components/tables/TableItem";
import InterproOntologyProcessor from "@/business/ontology/functional/interpro/InterproOntologyProcessor";

@Component({
    components: {
        AmountTable
    }
})
export default class GoAmountTable extends Vue {
    @Prop({ required: true })
    private interproCountTable: CountTable<InterproCode>;
    @Prop({ required: false })
    private interproPeptideMapping: Map<InterproCode, Peptide[]>;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: false })
    private searchConfiguration: SearchConfiguration;

    private items: TableItem[] = [];

    public async mounted() {
        await this.onCountTableChanged();
    }

    @Watch("interproCountTable")
    private async onCountTableChanged() {
        this.loading = true;

        const interproOntologyProcessor = new InterproOntologyProcessor();
        const interproOntology = await interproOntologyProcessor.getOntology(this.interproCountTable);
        const newItems = this.interproCountTable.getOntologyIds().map(interproCode => {
            const interproDefinition = interproOntology.getDefinition(interproCode);

            return new TableItem(
                this.interproCountTable.getCounts(interproCode),
                interproDefinition.name,
                interproDefinition.code,
                interproDefinition
            );
        });

        this.items.length = 0;
        this.items.push(...newItems);

        this.loading = false;
    }
}
</script>

<style scoped>
</style>
