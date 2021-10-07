<template>
    <v-card flat>
        <v-card-text>
            <span v-html="trustLine" class="go-trust"></span>
            <v-select :items="namespaceValues" label="Category" v-model="selectedNamespace"></v-select>
            <amount-table
                annotation-name="InterPro-Entry"
                :item-retriever="getSelectedItemRetriever()"
                :external-url-constructor="getUrl"
                :loading="isComputing"
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

@Component({
    components: { AmountTable }
})
export default class SingleInterproSummaryCard extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

    private trust: FunctionalTrust = null;
    private trustLine: string = "";
    private isComputing: boolean = false;

    // @ts-ignore
    private namespaceValues: string[] = ["all"].concat(
        Object.values(InterproNamespace).map(x => x.toString()).sort()
    );
    private selectedNamespace: string = "all";

    private computedItems: {
        itemRetriever: AmountTableItemRetriever<InterproCode, InterproDefinition>;
        namespace: string
    }[] = [];

    private created() {
        for (const ns of this.namespaceValues) {
            this.computedItems.push({
                itemRetriever: undefined,
                namespace: ns
            });
        }
        this.recompute();
    }

    @Watch("peptide")
    @Watch("equateIl")
    private async recompute() {
        if (this.peptide) {
            this.isComputing = true;

            const interproProteinProcessor = new InterproProteinCountTableProcessor(
                this.peptide,
                this.equateIl,
                this.communicationSource
            );

            this.trust = await interproProteinProcessor.getTrust();
            this.trustLine = FunctionalUtils.computeTrustLine(
                this.trust,
                "InterPro-entry",
                "protein"
            );

            for (const [i, ns] of this.namespaceValues.entries()) {
                let countTable: CountTable<InterproCode>;

                if (ns === "all") {
                    countTable = await interproProteinProcessor.getCountTable();
                } else {
                    countTable = await interproProteinProcessor.getCountTable(ns as InterproNamespace);
                }

                const ontologyProcessor = new InterproOntologyProcessor(this.communicationSource.getInterproCommunicator());
                const ontology = await ontologyProcessor.getOntology(countTable);

                const itemRetriever = new SingleAmountTableItemRetriever(
                    countTable,
                    ontology,
                    this.trust.totalAmountOfItems
                );

                const currentObj = this.computedItems[i];
                currentObj.itemRetriever = itemRetriever;
            }

            this.isComputing = false;
        }
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
