<template>
    <v-card flat>
        <v-card-text>
            <span v-html="trustLine" class="go-trust"></span>
            <v-select :items="namespaceValues" label="Category" v-model="selectedNamespace"></v-select>
            <amount-table
                annotation-name="InterPro-Entry"
                :item-retriever="getSelectedItemRetriever()"
                :external-url-constructor="getUrl"
                :show-percentage="false"
                :show-namespace="true"
                :rows-per-page="10">
            </amount-table>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import { CountTable } from "./../../../business/counts/CountTable";
import InterproDefinition, { InterproCode } from "./../../../business/ontology/functional/interpro/InterproDefinition";
import { InterproNamespace } from "./../../../business/ontology/functional/interpro/InterproNamespace";
import InterproOntologyProcessor from "./../../../business/ontology/functional/interpro/InterproOntologyProcessor";
import { FunctionalUtils } from "./../functional/FunctionalUtils";
import InterproProteinCountTableProcessor
    from "./../../../business/processors/functional/interpro/InterproProteinCountTableProcessor";
import CommunicationSource from "./../../../business/communication/source/CommunicationSource";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import AmountTable from "@/components/tables/AmountTable.vue";
import SingleAmountTableItemRetriever from "@/components/analysis/single/SingleAmountTableItemRetriever";
import { Ontology } from "@/business";

@Component({
    components: { AmountTable }
})
export default class SingleInterproSummaryCard extends Vue {
    // @ts-ignore
    private namespaceValues: string[] = ["all"].concat(
        Object.values(InterproNamespace).map(x => x.toString()).sort()
    );
    private selectedNamespace: string = "all";

    get interproProteinProcessor(): InterproProteinCountTableProcessor {
        return this.$store.getters.peptideStatus.interproProteinCountTableProcessor;
    }

    get trust(): FunctionalTrust {
        return this.interproProteinProcessor.getTrust();
    }

    get trustLine(): string {
        return FunctionalUtils.computeTrustLine(this.trust, "InterPro-entry", "protein");
    }

    get interproOntology(): Ontology<InterproCode, InterproDefinition> {
        return this.$store.getters.peptideStatus.interproOntology;
    }

    get computedItems(): {
        itemRetriever: AmountTableItemRetriever<InterproCode, InterproDefinition>;
        namespace: string
    }[] {
        const result = [];

        for (const [i, ns] of this.namespaceValues.entries()) {
            let countTable: CountTable<InterproCode>;

            if (ns === "all") {
                countTable = this.interproProteinProcessor.getCountTable();
            } else {
                countTable = this.interproProteinProcessor.getCountTable(ns as InterproNamespace);
            }

            const itemRetriever = new SingleAmountTableItemRetriever(
                countTable,
                this.interproOntology,
                this.trust.totalAmountOfItems
            );

            result.push({
                itemRetriever,
                namespace: ns
            });
        }

        return result;
    }

    private getSelectedItemRetriever(): AmountTableItemRetriever<InterproCode, InterproDefinition> {
        return this.computedItems.filter(i => i.namespace === this.selectedNamespace)[0].itemRetriever;
    }

    private getUrl(code: string): string {
        return `https://www.ebi.ac.uk/interpro/search/text/${code.substr(4)}/#table`;
    }
}
</script>

<style scoped>

</style>
