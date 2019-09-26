<template>
  <v-app>
    <select-datasets-card :selected-datasets="[]" />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from "vue-class-component";
import SelectDatasetsCard from './components/dataset/SelectDatasetsCard.vue';
import {TaxaPeptideProcessor} from './logic/processors/peptide/taxa/TaxaPeptideProcessor';
import PeptideContainer from './logic/data-management/PeptideContainer'

@Component({
  components: {SelectDatasetsCard}
})
export default class App extends Vue {
  private selectedDatasets = [];
}

var processor = new TaxaPeptideProcessor();
var container = new PeptideContainer();
container.setPeptides(["AAAAA", "AAAAL"])
var mpaConfig = {il: true, dupes: false, missed: false};

processor.process(container, mpaConfig)

</script>
