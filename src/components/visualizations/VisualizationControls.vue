<template>
    <div
        ref="container"
        style="height: 100%; position: relative; background-color: white;"
    >
        <div
            v-if="!loading"
            class="control-bar"
            :style="overlap ? 'position: absolute' : 'position: relative'"
        >
            <span class="align-self-center me-1 text-caption">
                {{ caption }}
            </span>

            <v-menu v-if="settings">
                <template #activator="{ props }">
                    <v-btn
                        class="ma-1"
                        icon="mdi-cog-outline"
                        size="x-small"
                        v-bind="props"
                        :elevation="0"
                    />
                </template>
                <v-list>
                    <slot name="settings" />
                </v-list>
            </v-menu>

            <v-btn
                v-if="rotate"
                class="ma-1"
                size="x-small"
                icon="mdi-format-rotate-90"
                :elevation="0"
                @click="rotate"
            />

            <v-btn
                v-if="download && !hideDownload"
                class="ma-1"
                size="x-small"
                icon="mdi-download"
                :elevation="0"
                @click="download"
            />

            <v-btn
                v-else-if="internalDownload && !hideDownload"
                class="ma-1"
                size="x-small"
                fab
                :elevation="0"
                icon="mdi-download"
                @click="downloadOpen = true"
            />

            <v-btn
                v-if="reset"
                class="ma-1"
                size="x-small"
                icon="mdi-restore"
                :elevation="0"
                @click="reset"
            />

            <v-btn
                v-if="fullscreen"
                class="ma-1"
                size="x-small"
                icon="mdi-fullscreen"
                :elevation="0"
                @click="fullscreen"
            />
        </div>

        <div :style="overlap ? 'height: 100%;' : 'height: calc(100% - 40px); position: relative'">
            <slot name="visualization" />
        </div>

        <DownloadImageModal
            :open-modal="downloadOpen"
            :image-source="element()"
            supports-svg
            @close="downloadOpen = false"
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

// @ts-ignore (ideally, in the future, we should check whether the query selector returns an empty result and adjust accordingly)
const element = () => new SvgImageSource(container.value?.querySelector("svg"));
</script>

<style scoped>
    .control-bar {
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
