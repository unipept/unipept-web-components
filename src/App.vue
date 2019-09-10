<template>
  <v-app>
    <v-content>
      <ComponentA/>
      <SelectDatasetsCard :selected-datasets="[]"/>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import SelectDatasetsCard from './components/dataset/SelectDatasetsCard.vue';

export default Vue.extend({
  name: 'App',
  components: {
    SelectDatasetsCard
  },
  data: () => ({
    //
  }),
});
</script>
