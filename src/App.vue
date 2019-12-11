<template>
  <v-app>
    <p>This is a test...</p>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
    components: {  }
})
export default class App extends Vue {
  private selectedDatasets = [];
}
</script>
