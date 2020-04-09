<docs>
    The MatchedProteinsTable is a component that displays a list of all proteins that are associated with a given
    peptide. This table shows the UniProt ID's, protein name, organism in which the protein occurs and all associated
    functional annotations.
</docs>

<template>
    <v-data-table>

    </v-data-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class MatchedProteinsTable extends Vue {
    private headers = [
        {
            text: "UniProt ID",
            align: "start",
            filterable: false,
            value: "uniprotAccessionId"
        }
    ];
}
</script>

<style scoped>

</style>
