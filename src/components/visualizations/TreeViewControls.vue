<template>
    <div style="height: 100%; position: relative;">
        <div v-if="!loading" class="controlbar">
            <span class="align-self-center me-1 text-caption">
                Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root
            </span>
            <v-btn v-if="download" class="ma-1" x-small fab @click="download" :elevation="0">
                <v-icon>mdi-download</v-icon>
            </v-btn>
            <v-btn v-if="reset" class="ma-1" x-small fab @click="reset" :elevation="0">
                <v-icon>mdi-restore</v-icon>
            </v-btn>
            <v-btn  v-if="fullscreen" class="ma-1" x-small fab @click="fullscreen" :elevation="0">
                <v-icon>mdi-fullscreen</v-icon>
            </v-btn>
        </div>

        <slot name="treeview"></slot>
    </div>
</template>

<script setup lang="ts">
export interface Props {
    loading: boolean

    fullscreen?: () => void
    download?: () => void
    reset?: () => void
}

defineProps<Props>();
</script>

<style scoped>
    .controlbar {
        position: absolute;
        display: flex;
        justify-content: end;
        align-self: center;
        opacity: 0.8;
        width: 100%;
        background-color: #EDEDED;
        right: 0;
        top: 0;
    }
</style>
