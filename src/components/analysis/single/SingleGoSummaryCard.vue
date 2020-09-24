<docs>
    A variant of the GoSummaryCard that's specifically designed for the analysis of a single peptide. This variant works
    with a peptide as input and provides the counted GO-terms in function of the amount of proteins associated with it.
</docs>

<template>
    <v-card flat>
        <v-card-text>
            <span v-html="trustLine" class="go-trust"></span>
            <go-summary
                v-for="computedItem of computedItems"
                :key="computedItem.namespace"
                :item-retriever="computedItem.itemRetriever"
                :definitions="computedItem.definitions"
                :namespace="computedItem.namespace"
                :show-percentage="false"
                :loading="isComputing">
            </go-summary>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { Peptide, GoNamespace, GoDefinition, GoCode } from "@/business";
import GoProteinCountTableProcessor from "./../../../business/processors/functional/go/GoProteinCountTableProcessor";
import GoOntologyProcessor from "./../../../business/ontology/functional/go/GoOntologyProcessor";
import { FunctionalUtils } from "./../functional/FunctionalUtils";
import GoSummary from "./../functional/GoSummary.vue";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import CommunicationSource from "./../../../business/communication/source/CommunicationSource";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import SingleAmountTableItemRetriever from "@/components/analysis/single/SingleAmountTableItemRetriever";

@Component({
    components: {
        GoSummary
    }
})
export default class SingleGoSummaryCard extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

    private trust: FunctionalTrust = null;
    private trustLine: string = "";
    private isComputing: boolean = false;

    private computedItems: {
        itemRetriever: AmountTableItemRetriever<GoCode, GoDefinition>,
        definitions: GoDefinition[],
        namespace: string
    }[] = [];

    private mounted() {
        for (const namespace of Object.values(GoNamespace).sort()) {
            this.computedItems.push({
                itemRetriever: undefined,
                definitions: [],
                namespace: namespace
            });
        }

        this.recompute();
    }

    @Watch("peptide")
    @Watch("equateIl")
    private async recompute() {
        if (this.peptide) {
            this.isComputing = true;

            const goProteinProcessor = new GoProteinCountTableProcessor(
                this.peptide,
                this.equateIl,
                this.communicationSource
            );

            this.trust = await goProteinProcessor.getTrust();
            this.trustLine = FunctionalUtils.computeTrustLine(this.trust, "GO-term", "protein");

            for (const [idx, namespace] of Object.values(GoNamespace).sort().entries()) {
                const functionalCountTable = await goProteinProcessor.getCountTable(namespace);

                const ontologyProcessor = new GoOntologyProcessor(this.communicationSource);
                const ontology = await ontologyProcessor.getOntology(functionalCountTable);

                const itemRetriever = new SingleAmountTableItemRetriever(
                    functionalCountTable,
                    ontology,
                    this.trust.totalAmountOfItems
                );

                const currentObj = this.computedItems[idx];
                currentObj.itemRetriever = itemRetriever;
                currentObj.definitions.splice(0, currentObj.definitions.length);
                currentObj.definitions.push(
                    ...functionalCountTable.getOntologyIds().map(id => ontology.getDefinition(id))
                );
            }

            this.isComputing = false;
        }
    }
}
</script>

<style scoped>

</style>
