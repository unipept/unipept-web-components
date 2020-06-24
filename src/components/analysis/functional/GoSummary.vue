<docs>
    This component displays both a GoAmountTable and a QuickGoCard. By providing the `loading` prop, the loading state
    of this component will be triggered.
</docs>

<template>
    <v-row>
        <v-col :cols="9">
            <go-amount-table
                :assay="assay"
                :namespace="namespace"
                :show-percentage="showPercentage">
            </go-amount-table>
        </v-col>
        <v-col :cols="3">
            <quick-go-card :items="definitions">
            </quick-go-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import GoAmountTable from "./../../tables/GoAmountTable.vue"
import QuickGoCard from "./QuickGoCard.vue";
import GoDefinition, { GoCode } from "./../../../business/ontology/functional/go/GoDefinition";
import { CountTable } from "./../../../business/counts/CountTable";
import { Ontology } from "./../../../business/ontology/Ontology";
import ProteomicsAssay from "./../../../business/entities/assay/ProteomicsAssay";
import GoCountTableProcessor from "./../../../business/processors/functional/go/GoCountTableProcessor";
import { GoNamespace } from "./../../../business/ontology/functional/go/GoNamespace";

@Component({
    components: {
        GoAmountTable,
        QuickGoCard
    }
})
export default class GoSummary extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: true })
    private namespace: GoNamespace;

    /**
     * Do we show the counts in an absolute or relative manner? If this is set to true, the relative counts will be
     * displayed. Otherwise the absolute will be given.
     */
    @Prop({ required: false, default: false })
    private showPercentage: boolean;

    // A list of all GO-terms that should be displayed in this component.
    private definitions: GoDefinition[] = [];

    private mounted() {
        this.onInputsChanged();
    }

    get goCountTableProcessor(): GoCountTableProcessor {
        return this.$store.getters["go/filteredData"](this.assay)?.processor;
    }

    get goOntology(): Ontology<GoCode, GoDefinition> {
        return this.$store.getters["go/ontology"](this.assay);
    }

    @Watch("goCountTableProcessor")
    @Watch("goOntology")
    private async onInputsChanged() {
        this.definitions.splice(0, this.definitions.length);
        if (this.goCountTableProcessor && this.goOntology) {
            const goCountTable: CountTable<GoCode> = await this.goCountTableProcessor.getCountTable(this.namespace);
            this.definitions.push(...goCountTable.getOntologyIds().map(id => this.goOntology.getDefinition(id)));
        }
    }
}
</script>

<style scoped>

</style>
