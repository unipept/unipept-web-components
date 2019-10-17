<template>
  <v-app>
    <analysis-component :selected-datasets="[]" :stored-datasets="[]"></analysis-component>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from "vue-class-component";
import SelectDatasetsCard from './components/dataset/SelectDatasetsCard.vue';
import AnalysisComponent from './components/dataset/AnalysisComponent.vue';

@Component({
  components: {SelectDatasetsCard, AnalysisComponent}
})
export default class App extends Vue {
  private selectedDatasets = [];
}
</script>
