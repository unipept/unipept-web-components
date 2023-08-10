<template>
    <v-app>
        <v-main>
            <tree-map :data="data" />
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import * as taxonomyData from "./taxonomy.json";
import TreeMap from "@/components/visualizations/TreeMap.vue";

const data = ref(taxonomyData);
</script>
