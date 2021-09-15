<template>
  <v-app>
    <p>This is a test...</p>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Pept2DataCommunicator from "@/business/communication/peptides/Pept2DataCommunicator";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import { CountTable, Peptide } from "@/business";

@Component({
    components: {  }
})
export default class App extends Vue {}
</script>
