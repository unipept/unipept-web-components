<docs>
    A card with 5 different tabs that each present a different view on the matched proteins information for a single
    peptide.
</docs>

<template>
    <v-card>
        <v-tabs slider-color="secondary" background-color="primary" dark v-model="currentTab">
            <v-tab>
                Matched proteins
            </v-tab>
            <v-tab>
                Lineage tree
            </v-tab>
            <v-tab>
                Lineage table
            </v-tab>
            <v-tab>
                GO terms
            </v-tab>
            <v-tab>
                EC numbers
            </v-tab>
            <v-tab>
                Interpro
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="currentTab">
            <v-tab-item>
                <matched-proteins-table :peptide="peptide" :equate-il="equateIl"></matched-proteins-table>
            </v-tab-item>
            <v-tab-item>
                <lineage-tree :peptide="peptide" :equate-il="equateIl"></lineage-tree>
            </v-tab-item>
            <v-tab-item>
                <lineage-table :peptide="peptide" :equate-il="equateIl"></lineage-table>
            </v-tab-item>
            <v-tab-item>
                <single-go-summary-card
                    :peptide="peptide"
                    :equate-il="equateIl"
                    :communication-source="communicationSource">
                </single-go-summary-card>
            </v-tab-item>
            <v-tab-item>
                <single-ec-summary-card
                    :peptide="peptide"
                    :equate-il="equateIl"
                    :communication-source="communicationSource">
                </single-ec-summary-card>
            </v-tab-item>
            <v-tab-item>
                <single-interpro-summary-card
                    :peptide="peptide"
                    :equate-il="equateIl"
                    :communication-source="communicationSource">
                </single-interpro-summary-card>
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import LineageTree from "./../../lineage/LineageTree.vue"
import LineageTable from "./../../lineage/LineageTable.vue";
import MatchedProteinsTable from "./../../tables/MatchedProteinsTable.vue";
import SingleGoSummaryCard from "./SingleGoSummaryCard.vue";
import SingleEcSummaryCard from "./SingleEcSummaryCard.vue";
import SingleInterproSummaryCard from "./SingleInterproSummaryCard.vue";
import CommunicationSource from "./../../../business/communication/source/CommunicationSource";

@Component({
    components: {
        SingleInterproSummaryCard,
        SingleEcSummaryCard,
        SingleGoSummaryCard,
        MatchedProteinsTable,
        LineageTree,
        LineageTable
    }
})
export default class SinglePeptideAnalysisCard extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

    private currentTab: number = 0;
}
</script>

<style scoped>

</style>
