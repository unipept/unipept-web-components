<template>
    <v-card>
        <v-tabs 
            slider-color="secondary" 
            background-color="primary" 
            dark 
            v-model="currentTab"
        >
            <v-tab>Matched proteins</v-tab>
            <v-tab>Lineage tree</v-tab>
            <v-tab>Lineage table</v-tab>
            <v-tab>GO terms</v-tab>
            <v-tab>EC numbers</v-tab>
            <v-tab>Interpro</v-tab>
        </v-tabs>
        <v-tabs-items v-model="currentTab">
            <v-tab-item>
                <MatchedProteinsTable :assay="assay" />
            </v-tab-item>
            <v-tab-item>
                <LineageTree :assay="assay" />
            </v-tab-item>
            <v-tab-item>
                <LineageTable :assay="assay" />
            </v-tab-item>
            <v-tab-item>
                <GoSummaryCard 
                    :analysisInProgress="assay.analysisInProgress"
                    :goProcessor="assay.goProteinCountTableProcessor"
                    :goOntology="assay.goOntology"
                />
            </v-tab-item>
            <v-tab-item>
                <EcSummaryCard 
                    :analysisInProgress="assay.analysisInProgress"
                    :ecProcessor="assay.ecProteinCountTableProcessor"
                    :ecOntology="assay.ecOntology"
                    :ecTree="assay.ecTree"
                />
            </v-tab-item>
            <v-tab-item>
                <InterproSummaryCard
                    :analysisInProgress="assay.analysisInProgress"
                    :interproProcessor="assay.interproProteinCountTableProcessor"
                    :interproOntology="assay.interproOntology"
                />
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script setup lang="ts">
import { SinglePeptideAnalysisStatus } from "@/interface";
import { defineProps, ref } from "vue";
import MatchedProteinsTable from "../tables/MatchedProteinsTable.vue";
import LineageTable from "../tables/LineageTable.vue";
import LineageTree from "../trees/LineageTree.vue";
import GoSummaryCard from "../cards/GoSummaryCard.vue";
import EcSummaryCard from "../cards/EcSummaryCard.vue";
import InterproSummaryCard from "../cards/InterproSummaryCard.vue";

export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const currentTab = ref<number>(0);
</script>
