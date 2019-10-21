<template>
  <v-tooltip :top="position === 'top'" :bottom="position === 'bottom'" :left="position === 'left'" :right="position === 'right'" >
    <template v-slot:activator="{ on }">
      <span v-on="on">
       <slot></slot>
      </span>
    </template>
    <span>{{ message }}</span>
  </v-tooltip>
</template>

<script lang='ts'>
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator"

  @Component
export default class Tooltip extends Vue {
    @Prop()
    private message!: string;
    @Prop({ default: "top" })
    private position: string;
}
</script>

<style scoped>
</style>