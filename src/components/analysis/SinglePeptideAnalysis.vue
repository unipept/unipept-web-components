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
                <GoSummaryCard :assay="assay" />
            </v-tab-item>
            <v-tab-item>
                <EcSummaryCard :assay="assay" />
            </v-tab-item>
            <v-tab-item>
                <InterproSummaryCard :assay="assay" />
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script setup lang="ts">
import { SinglePeptideAnalysisStatus } from "@/interface";
import { defineProps, ref } from "vue";
import MatchedProteinsTable from "../tables/MatchedProteinsTable.vue";
import LineageTable from "../tables/LineageTable.vue";
import InterproSummaryCard from "../cards/InterproSummaryCard.vue";
import EcSummaryCard from "../cards/EcSummaryCard.vue";
import GoSummaryCard from "../cards/GoSummaryCard.vue";
import LineageTree from "../trees/LineageTree.vue";

export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const currentTab = ref<number>(0);
</script>
