<docs>
    A card with 5 different tabs that each present a different view on the matched proteins information for a single
    peptide.
</docs>

<template>
    <v-card>
        <v-tabs slider-color="secondary" background-color="primary" dark>
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
        <v-tabs-items>

        </v-tabs-items>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { Peptide } from "./../../../business/ontology/raw/Peptide";

@Component
export default class SinglePeptideAnalysisCard extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;


}
</script>

<style scoped>

</style>
