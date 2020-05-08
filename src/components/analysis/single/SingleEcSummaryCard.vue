<docs>
    A variant of the EcSummaryCard that's specifically designed for the analysis of a single peptide. This variant works
    with a peptide as input and provides the counted EC-numbers in function of the amount of proteins associated with
    it.
</docs>

<template>
    <ec-summary-card
        :loading="loading"
        :analysis-in-progress="true"
        :ec-count-table="countTable"
        :ec-ontology="ontology"
        :relative-counts="trust ? trust.totalAmountOfItems : 1"
        :show-percentage="false"
        :communication-source="communicationSource">
        <template v-slot:analysis-header>
            <span v-html="trustLine" class="ec-trust"></span>
        </template>
    </ec-summary-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import EcSummaryCard from "./../functional/EcSummaryCard.vue";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { Prop, Watch } from "vue-property-decorator";
import EcDefinition, { EcCode } from "./../../../business/ontology/functional/ec/EcDefinition";
import { CountTable } from "./../../../business/counts/CountTable";
import { Ontology } from "./../../../business/ontology/Ontology";
import EcProteinCountTableProcessor from "./../../../business/processors/functional/ec/EcProteinCountTableProcessor";
import EcOntologyProcessor from "./../../../business/ontology/functional/ec/EcOntologyProcessor";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import { FunctionalUtils } from "./../functional/FunctionalUtils";
import CommunicationSource from "./../../../business/communication/source/CommunicationSource";

@Component({
    components: { EcSummaryCard }
})
export default class SingleEcSummaryCard extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

    private trust: FunctionalTrust = null;
    private trustLine: string = "";
    private loading: boolean = false;

    private countTable: CountTable<EcCode> = null;
    private ontology: Ontology<EcCode, EcDefinition> = null;

    private mounted() {
        this.onInputsChanged();
    }

    @Watch("peptide")
    @Watch("equateIl")
    private async onInputsChanged() {
        if (this.peptide) {
            this.loading = true;

            const ecProteinProcessor = new EcProteinCountTableProcessor(this.peptide, this.equateIl);
            this.countTable = await ecProteinProcessor.getCountTable();

            const ontologyProcessor = new EcOntologyProcessor(this.communicationSource);
            this.ontology = await ontologyProcessor.getOntology(this.countTable);

            this.trust = await ecProteinProcessor.getTrust();
            this.trustLine = FunctionalUtils.computeTrustLine(this.trust, "EC-number", "protein");

            this.loading = false;
        }
    }
}
</script>

<style scoped>

</style>
