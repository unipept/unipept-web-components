<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="820"
        @click:outside="closeDialog"
    >
        <v-card v-if="preparingImage">
            <v-card-title>
                Please wait while we are preparing your image
            </v-card-title>
            <v-card-text>
                Loading preview...
                <v-progress-linear
                    indeterminate
                    rounded
                />
            </v-card-text>
        </v-card>

        <v-card v-else>
            <div class="d-flex justify-end">
                <v-btn
                    icon="mdi-close"
                    @click="closeDialog"
                />
            </div>

            <div class="text-center">
                <img
                    :src="dataUrl"
                    style="max-width: 800px; max-height: 400px; padding: 8px; border: 1px solid #80808069; border-radius: 4px;"
                >
            </div>

            <div class="ma-4">
                <div class="d-flex justify-start align-center">
                    <span
                        class="mr-2"
                        style="position: relative; top: 3px;"
                    >
                        Image format
                    </span>
                    <v-select
                        v-model="formatValue"
                        :items="formatValues"
                        item-text="label"
                        dense
                        hide-details
                    />
                </div>
                <div class="d-flex justify-start align-center">
                    <span
                        class="mr-2"
                        style="position: relative; top: 3px;"
                    >
                        Scaling factor
                    </span>
                    <v-select
                        v-model="scalingValue"
                        :items="enlargementValues"
                        item-text="label"
                        dense
                        hide-details
                        :disabled="isSvg()"
                    />
                </div>
                <div
                    v-if="isSvg()"
                    class="mt-4"
                >
                    <span>SVG images are vector-based and are thus resolution independent.</span>
                </div>
                <div
                    v-else
                    class="mt-4"
                >
                    <span>
                        Resulting resolution:
                        {{ resolutionWidth * scalingValue }}x{{ resolutionHeight * scalingValue }}
                        px
                    </span>
                </div>
            </div>
            <v-card-actions class="justify-center">
                <v-btn
                    id="download-png-btn"
                    color="primary"
                    @click="saveImage()"
                >
                    <v-icon left>
                        mdi-download
                    </v-icon>Download image
                </v-btn>
            </v-card-actions>
            <v-divider />
            <v-card-text>
                <br>
                If you use this figure in a publication, please cite:
                <br>
                Mesuere et al. (2015) Proteomics
                <a
                    href="https://doi.org/10.1002/pmic.201400361"
                    target="_blank"
                >
                    doi:10.1002/pmic.201400361
                </a>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import useDownload from '@/composables/useDownload';
import ImageSource from '@/logic/util/image/ImageSource';
import { ref, watch } from 'vue';
export interface Props {
    openModal: boolean
    supportsSvg?: boolean
    imageSource: ImageSource | undefined
}

// eslint-disable-next-line
const props = withDefaults(defineProps<Props>(), {
    supportsSvg: false,
});

const emits = defineEmits(['close'])

const dataUrl = ref<string>("");

const dialogOpen = ref<boolean>(props.openModal);
const preparingImage = ref<boolean>(true);

const formatValues = ref(['PNG']);
const formatValue = ref(formatValues.value[0]);

const enlargementValues = [
    { value: 0.5, label: "50%"   },
    { value: 1,   label: "100%"  },
    { value: 2,   label: "200%"  },
    { value: 5,   label: "500%"  },
    { value: 10,  label: "1000%" }
];
const scalingValue = ref(enlargementValues[1].value);

const resolutionWidth = ref<number>(0);
const resolutionHeight = ref<number>(0);

const { download } = useDownload();

const closeDialog = () => {
    dialogOpen.value = false;
    emits('close', dialogOpen.value);
}

const saveImage = async () => {
    if(isSvg()) {
        const url = await props.imageSource?.toSvgDataUrl() || "";
        download(url, "unipept.svg");
    } else {
        const url = await props.imageSource?.toPngDataUrl(scalingValue.value) || "";
        download(url, "unipept.png");
    }
}

const isSvg = () => {
    return formatValue.value === "SVG";
}

const isPng = () => {
    return formatValue.value === "PNG";
}

watch(() => props.openModal, async (newVal) => {
    preparingImage.value = true;

    dialogOpen.value = newVal;

    if(props.supportsSvg) {
        formatValues.value = ['SVG', 'PNG'];
        formatValue.value = formatValues.value[0];
    }

    resolutionWidth.value = props.imageSource?.getOriginalWidth() || 0;
    resolutionHeight.value = props.imageSource?.getOriginalHeight() || 0;
    dataUrl.value = await props.imageSource?.toSvgDataUrl() || "";

    preparingImage.value = false;
});

watch(() => formatValue.value, async (newVal) => {
    if(newVal === "SVG") {
        dataUrl.value = await props.imageSource?.toSvgDataUrl() || "";
    } else {
        dataUrl.value = await props.imageSource?.toPngDataUrl(scalingValue.value) || "";
    }
});

watch(() => scalingValue.value, async (newVal) => {
    if(isPng()) {
        dataUrl.value = await props.imageSource?.toPngDataUrl(newVal) || "";
    }
});
</script>
