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
                <matched-proteins-table>
                </matched-proteins-table>
            </v-tab-item>
            <v-tab-item>
                <lineage-tree>
                </lineage-tree>
            </v-tab-item>
            <v-tab-item>
                <lineage-table>
                </lineage-table>
            </v-tab-item>
            <v-tab-item>
                <single-go-summary-card>
                </single-go-summary-card>
            </v-tab-item>
            <v-tab-item>
                <single-ec-summary-card>
                </single-ec-summary-card>
            </v-tab-item>
            <v-tab-item>
                <single-interpro-summary-card>
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
    private currentTab: number = 0;
}
</script>

<style scoped>

</style>
