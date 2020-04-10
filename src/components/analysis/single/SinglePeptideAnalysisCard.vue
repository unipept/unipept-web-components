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
        </v-tabs>
        <v-tabs-items v-model="currentTab">
            <v-tab-item>

            </v-tab-item>
            <v-tab-item>
                <lineage-tree :peptide="peptide" :equate-il="equateIl"></lineage-tree>
            </v-tab-item>
            <v-tab-item>
                <lineage-table :peptide="peptide" :equate-il="equateIl"></lineage-table>
            </v-tab-item>
            <v-tab-item>

            </v-tab-item>
            <v-tab-item>

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

@Component({
    components: {
        LineageTree,
        LineageTable
    }
})
export default class SinglePeptideAnalysisCard extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;

    private currentTab: number = 0;
}
</script>

<style scoped>

</style>
