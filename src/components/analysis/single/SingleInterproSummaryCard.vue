<docs>
    A variant of the InterproSummaryCard that's specifically designed for the analysis of a single peptide.
</docs>

<template>
    <interpro-summary-card
        :interpro-count-table="getCountTable"
        :interpro-ontology="getOntology"
        :loading="loading"
        :relative-counts="trust ? trust.totalAmountOfItems : 1"
        :show-percentage="false">
        <template v-slot:analysis-header>
            <span v-html="trustLine" class="interpro-trust"></span>
        </template>
    </interpro-summary-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import InterproSummaryCard from "./../functional/InterproSummaryCard.vue";
import { Prop, Watch } from "vue-property-decorator";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import { CountTable } from "./../../../business/counts/CountTable";
import InterproDefinition, { InterproCode } from "./../../../business/ontology/functional/interpro/InterproDefinition";
import { Ontology } from "./../../../business/ontology/Ontology";
import { InterproNamespace } from "./../../../business/ontology/functional/interpro/InterproNamespace";
import InterproOntologyProcessor from "./../../../business/ontology/functional/interpro/InterproOntologyProcessor";
import { FunctionalUtils } from "./../functional/FunctionalUtils";
import InterproProteinCountTableProcessor
    from "./../../../business/processors/functional/interpro/InterproProteinCountTableProcessor";

@Component({
    components: { InterproSummaryCard }
})
export default class SingleInterproSummaryCard extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;

    private trust: FunctionalTrust = null;
    private trustLine: string = "";
    private loading: boolean = false;

    private namespaceValues: string[] = ["all"].concat(Object.values(InterproNamespace));

    private items: {
        countTable: CountTable<InterproCode>,
        title: string,
        namespace: string
        ontology: Ontology<InterproCode, InterproDefinition>
    }[] = [];

    private created() {
        for (const ns of this.namespaceValues) {
            this.items.push({
                countTable: undefined,
                title: "",
                namespace: ns,
                ontology: undefined
            });
        }
    }

    private mounted() {
        this.recompute();
    }

    @Watch("peptide")
    @Watch("equateIl")
    private async recompute() {
        if (this.peptide) {
            this.loading = true;

            const interproProteinProcessor = new InterproProteinCountTableProcessor(this.peptide, this.equateIl);


            for (const [i, ns] of this.namespaceValues.entries()) {
                let countTable: CountTable<InterproCode>;

                if (ns === "all") {
                    countTable = await interproProteinProcessor.getCountTable();
                } else {
                    countTable = await interproProteinProcessor.getCountTable(ns as InterproNamespace);
                }

                this.items[i].countTable = countTable;

                const ontologyProcessor = new InterproOntologyProcessor();
                this.items[i].ontology = await ontologyProcessor.getOntology(this.items[i].countTable);
            }

            this.trust = await interproProteinProcessor.getTrust();
            this.trustLine = FunctionalUtils.computeTrustLine(
                this.trust,
                "InterPro-entry",
                "protein"
            );

            this.loading = false;
        }
    }

    private getCountTable(ns: string): CountTable<InterproCode> {
        const item = this.items.find(item => item.namespace == ns);
        return item ? item.countTable : undefined;
    }

    private getOntology(ns: string): Ontology<InterproCode, InterproDefinition> {
        const item = this.items.find(item => item.namespace == ns);
        return item ? item.ontology : undefined;
    }
}
</script>

<style scoped>

</style>
