<template>
  <v-card>
      <v-card-title>QuickGo biological process</v-card-title>
      <v-card-text>

      </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import GoTerm from '@/logic/functional-annotations/GoTerm';

@Component
export default class QuickGOCard extends Vue {
    @Prop({required: true})
    private goTerms: GoTerm[];

    
}
</script>

<style>

</style>