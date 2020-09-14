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
export default class App extends Vue {
  private selectedDatasets = [];

  async mounted() {
      const pept2DataComm = new Pept2DataCommunicator();
      const countTable = new CountTable<Peptide>(new Map<Peptide, number>(
          [
              ["SGIVLPGQAQEKPQQAEVVAVGPGGVVDGK", 1],
              ["MEVAVGDKVIYSK", 1],
              ["WESGYNTR", 1],
              ["ATNYNAGDR", 1]
          ]
      ))
      await pept2DataComm.process(countTable, new SearchConfiguration());
      console.log(pept2DataComm.getPeptideResponse("ATNYNAGDR", new SearchConfiguration()));
  }
}
</script>
