<template>
  <v-app>
    <select-datasets-card :selected-datasets="[]" />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from "vue-class-component";
import SelectDatasetsCard from './components/dataset/SelectDatasetsCard.vue';

@Component({
  components: {SelectDatasetsCard}
})
export default class App extends Vue {
  private selectedDatasets = [];
}
</script>
