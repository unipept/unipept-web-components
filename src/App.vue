<template>
  <v-app>
    <v-content>
      <ComponentA/>
      <SearchSettingsForm/>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import SearchSettingsForm from './components/analysis/SearchSettingsForm.vue';

export default Vue.extend({
  name: 'App',
  components: {
    SearchSettingsForm
  },
  data: () => ({
    //
  }),
});
</script>
