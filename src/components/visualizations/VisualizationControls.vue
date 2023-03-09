<template>
    <div style="height: 100%; position: relative; background-color: white;" ref="container">
        <div v-if="!loading" class="controlbar" :style="overlap ? 'position: absolute' : 'position: relative'">
            <span class="align-self-center me-1 text-caption">
                {{ caption }}
            </span>

            <v-menu v-if="settings">
                <template v-slot:activator="{ on }">
                    <v-btn class="ma-1" fab x-small v-on="on" :elevation="0">
                        <v-icon>mdi-cog-outline</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <slot name="settings"></slot>
                </v-list>
            </v-menu>

            <v-btn v-if="rotate" class="ma-1" x-small fab @click="rotate" :elevation="0">
                <v-icon>mdi-format-rotate-90</v-icon>
            </v-btn>

            <v-btn v-if="download && !hideDownload" class="ma-1" x-small fab @click="download" :elevation="0">
                <v-icon>mdi-download</v-icon>
            </v-btn>

            <v-btn v-else-if="internalDownload && !hideDownload" class="ma-1" x-small fab @click="downloadOpen = true" :elevation="0">
                <v-icon>mdi-download</v-icon>
            </v-btn>

            <v-btn v-if="reset" class="ma-1" x-small fab @click="reset" :elevation="0">
                <v-icon>mdi-restore</v-icon>
            </v-btn>

            <v-btn v-if="fullscreen" class="ma-1" x-small fab @click="fullscreen" :elevation="0">
                <v-icon>mdi-fullscreen</v-icon>
            </v-btn>
        </div>

        <div :style="overlap ? 'height: 100%;' : 'height: calc(100% - 40px); position: relative'">
            <slot name="visualization"></slot>
        </div>

        <DownloadImageModal 
            :openModal="downloadOpen"
            :imageSource="element()"
            @close="downloadOpen = false"
            supportsSvg
        />
    </div>
</template>

<script setup lang="ts">
import SvgImageSource from '@/logic/util/image/SvgImageSource'
import { ref } from 'vue'
import { DownloadImageModal } from '../modals'

export interface Props {
    caption: string
    loading: boolean
    overlap?: boolean
    hideDownload?: boolean
    internalDownload?: boolean
    settings?: boolean

    rotate?: () => void
    download?: () => void
    reset?: () => void
    fullscreen?: () => void
}

withDefaults(defineProps<Props>(), {
    overlap: true,
    hideDownload: false,
    internalDownload: false,
    settings: false
});

// Will currently only work for svg images
const downloadOpen = ref(false)

const container = ref<HTMLElement | null>(null);

// @ts-ignore
const element = () => new SvgImageSource(container.value?.querySelector("svg"));
</script>

<style scoped>
    .controlbar {
        display: flex;
        justify-content: end;
        align-self: center;
        opacity: 0.8;
        width: 100%;
        height: 40px;
        background-color: #EDEDED;
        right: 0;
        top: 0;
    }
</style>
