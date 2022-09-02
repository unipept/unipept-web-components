<template>
  <v-btn :color="props.color" :size="props.size">
    Button
  </v-btn>
</template>

<script lang="ts" setup>
interface Props {
  color?: string;
  size?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: "primary",
  size: "medium"
});
</script>