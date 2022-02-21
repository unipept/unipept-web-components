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
                :show-percentage="false">
            </go-summary>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { Peptide, GoNamespace, GoDefinition, GoCode, FunctionalNamespace, Ontology } from "@/business";
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
    get goProteinProcessor(): GoProteinCountTableProcessor {
        return this.$store.getters.peptideStatus.goProteinCountTableProcessor;
    }

    get trust(): FunctionalTrust {
        return this.goProteinProcessor.getTrust();
    }

    get trustLine(): string {
        return FunctionalUtils.computeTrustLine(this.trust, "GO-term", "protein");
    }

    get goOntology(): Ontology<GoCode, GoDefinition> {
        return this.$store.getters.peptideStatus.goOntology;
    }

    get computedItems():  {
        itemRetriever: AmountTableItemRetriever<GoCode, GoDefinition>,
        definitions: GoDefinition[],
        namespace: string
    }[] {
        const result = [];

        for (const [idx, namespace] of Object.values(GoNamespace).sort().entries()) {
            const functionalCountTable = this.goProteinProcessor.getCountTable(namespace as FunctionalNamespace);

            const itemRetriever = new SingleAmountTableItemRetriever(
                functionalCountTable,
                this.goOntology,
                this.trust.totalAmountOfItems
            );

            result.push({
                itemRetriever,
                definitions: [...functionalCountTable.getOntologyIds().map(id => this.goOntology.getDefinition(id))],
                namespace
            });
        }

        return result;
    }
}
</script>

<style scoped>

</style>
