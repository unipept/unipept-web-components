<template>
    <v-app>
        <v-main>
            <tree-view :data="data" />
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import TreeView from "@/components/visualizations/TreeView.vue"
import { ref } from "vue";
import * as taxonomyData from "./taxonomy.json";

const data = ref(taxonomyData);
</script>
