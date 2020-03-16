<template>
    <amount-table
        :loading="loading"
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

@Component({
    components: {
        AmountTable
    }
})
export default class EcAmountTable extends Vue {
    @Prop({ required: true })
    private ecCountTable: CountTable<EcCode>;
    @Prop({ required: false })
    private ecPeptideMapping: Map<EcCode, Peptide[]>;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: false })
    private searchConfiguration: SearchConfiguration;

    private items: TableItem[] = [];

    public async mounted() {
        await this.onCountTableChanged();
    }

    @Watch("ecCountTable")
    public async onCountTableChanged() {
        this.loading = true;

        const ecOntologyProcessor = new EcOntologyProcessor();
        const ecOntology = await ecOntologyProcessor.getOntology(this.ecCountTable);
        const newItems = this.ecCountTable.getOntologyIds().map(ecCode => {
            const definition: EcDefinition = ecOntology.getDefinition(ecCode);

            return new TableItem(
                this.ecCountTable.getCounts(ecCode),
                definition.name,
                definition.code,
                definition
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
