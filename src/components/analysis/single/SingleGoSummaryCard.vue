<docs>
    A variant of the GoSummaryCard that's specifically designed for the analysis of a single peptide. This variant works
    with a peptide as input and provides the counted GO-terms in function of the amount of proteins associated with it.
</docs>

<template>
    <go-summary-card :loading="peptide === ''">
        <template v-slot:analysis-header>
            <span v-html="trustLine" class="go-trust"></span>
        </template>
        <template v-slot:content-biological-process>
            <go-summary
                :go-count-table="items[0].countTable"
                :namespace="namespaces[0]"
                :go-ontology="items[0].ontology"
                :relative-counts="trust ? trust.totalAmountOfItems : 1"
                :loading="loading"
                :show-percentage="false">
            </go-summary>
        </template>
        <template v-slot:content-cellular-component>
            <go-summary
                :go-count-table="items[1].countTable"
                :namespace="namespaces[1]"
                :go-ontology="items[1].ontology"
                :relative-counts="trust ? trust.totalAmountOfItems : 1"
                :loading="loading"
                :show-percentage="false">
            </go-summary>
        </template>
        <template v-slot:content-molecular-function>
            <go-summary
                :go-count-table="items[2].countTable"
                :namespace="namespaces[2]"
                :go-ontology="items[2].ontology"
                :relative-counts="trust ? trust.totalAmountOfItems : 1"
                :loading="loading"
                :show-percentage="false">
            </go-summary>
        </template>
    </go-summary-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { GoNamespace } from "./../../../business/ontology/functional/go/GoNamespace";
import { CountTable } from "./../../../business/counts/CountTable";
import GoDefinition, { GoCode } from "./../../../business/ontology/functional/go/GoDefinition";
import { Ontology } from "./../../../business/ontology/Ontology";
import StringUtils from "./../../../business/misc/StringUtils";
import GoProteinCountTableProcessor from "./../../../business/processors/functional/go/GoProteinCountTableProcessor";
import GoOntologyProcessor from "./../../../business/ontology/functional/go/GoOntologyProcessor";
import { FunctionalUtils } from "./../functional/FunctionalUtils";
import GoSummaryCard from "./../functional/GoSummaryCard.vue";
import GoSummary from "./../functional/GoSummary.vue";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";

@Component({
    components: {
        GoSummary,
        GoSummaryCard
    }
})
export default class SingleGoSummaryCard extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;

    private trust: FunctionalTrust = null;
    private trustLine: string = "";
    private loading: boolean = false;

    private namespaces: GoNamespace[] = Object.values(GoNamespace).sort();
    private items: {
        countTable: CountTable<GoCode>,
        definitions: GoDefinition[],
        title: string,
        ontology: Ontology<GoCode, GoDefinition>
    }[] = [];

    private created() {
        for (let ns of this.namespaces) {
            this.items.push({
                countTable: undefined,
                definitions: [],
                title: StringUtils.stringTitleize(ns.toString()),
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

            const goProteinProcessor = new GoProteinCountTableProcessor(this.peptide, this.equateIl);

            for (let i = 0; i < this.namespaces.length; i++) {
                const namespace: GoNamespace = this.namespaces[i];
                this.items[i].countTable = await goProteinProcessor.getCountTable(namespace);

                const ontologyProcessor = new GoOntologyProcessor();
                this.items[i].ontology = await ontologyProcessor.getOntology(this.items[i].countTable);

                this.items[i].definitions.length = 0;
                this.items[i].definitions.push(
                    ...this.items[i].countTable.getOntologyIds().map(id => this.items[i].ontology.getDefinition(id))
                );
            }

            this.trust = await goProteinProcessor.getTrust();
            this.trustLine = FunctionalUtils.computeTrustLine(this.trust, "GO-term", "protein");

            this.loading = false;
        }
    }
}
</script>

<style scoped>

</style>
