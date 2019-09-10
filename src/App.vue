<template>
  <v-app>
    <LoadDatasetsCard :stored-datasets="[]"/>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import LoadDatasetsCard from './components/dataset/LoadDatasetsCard.vue';

export default Vue.extend({
  name: 'App',
  components: {
    LoadDatasetsCard
  },
  data: () => ({
    //
  }),
});
</script>
