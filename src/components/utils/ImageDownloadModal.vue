<template>
    <v-dialog v-model="downloadDialogOpen" max-width="820">
        <v-card v-if="preparingImage">
            <v-card-title>
                Please wait while we are preparing your image
            </v-card-title>
            <v-card-text>
                Loading preview...
                <v-progress-linear indeterminate rounded />
            </v-card-text>
        </v-card>
        <v-card v-else>
            <div class="d-flex justify-end">
                <v-btn icon @click="downloadDialogOpen = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
            <div class="text-center">
                <img
                    :src="pngDataURL"
                    style="max-width: 800px; max-height: 400px; padding: 8px; border: 1px solid #80808069; border-radius: 4px;" />
            </div>
            <div class="ma-4">
                <div class="d-flex justify-start align-center">
                    <span class="mr-2" style="position: relative; top: 3px;">Image format</span>
                    <v-select
                        :items="formatValues"
                        item-text="label"
                        v-model="formatValue"
                        dense
                        hide-details>
                    </v-select>
                </div>
                <div class="d-flex justify-start align-center">
                    <span class="mr-2" style="position: relative; top: 3px;">Scaling factor</span>
                    <v-select
                        :items="enlargementValues"
                        item-text="label"
                        v-model="scalingValue"
                        dense
                        hide-details
                        :disabled="formatValue === 'SVG'">
                    </v-select>
                </div>
                <div class="mt-4" v-if="formatValue === 'SVG'">
                    <span>SVG images are vector-based and are thus resolution independent.</span>
                </div>
                <div class="mt-4" v-else>
                    <span>
                        Resulting resolution:
                        {{ resolutionWidth * scalingValue }}x{{ resolutionHeight * scalingValue }}
                        px
                    </span>
                </div>
            </div>
            <v-card-actions class="justify-center">
                <v-btn @click="saveImage()" id="download-png-btn" color="primary">
                    <v-icon left>mdi-download</v-icon>Download image
                </v-btn>
            </v-card-actions>
            <v-divider/>
            <v-card-text>
                <br>
                If you use this figure in a publication, please cite:
                <br>
                Mesuere et al. (2015) Proteomics
                <a href="https://doi.org/10.1002/pmic.201400361" target="_blank">
                    doi:10.1002/pmic.201400361
                </a>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import NetworkUtils from "./../../business/communication/NetworkUtils";
import PngSource from "@/business/image/PngSource";

@Component
export default class ImageDownloadModal extends Vue {
    /**
     * Filename that should be given to the downloaded file.
     */
    @Prop({ required: true })
    private baseFileName: string;

    /**
     * SVG-string that corresponds to a valid SVG file (and that can directly be downloaded as such, if required).
     */
    @Prop({ required: false })
    private svgString: string;

    @Prop({ required: true })
    private pngSource: PngSource;

    @Prop({ required: true })
    private value: boolean;

    // Internal variable to keep track of whether the dialog is open or not
    private downloadDialogOpen: boolean = false;
    private preparingImage: boolean = true;

    private pngDataURL: string = "";

    private resolutionWidth: number = 0;
    private resolutionHeight: number = 0;

    private enlargementValues: { value: number, label: string }[] = [
        {
            value: 0.5,
            label: "50%"
        },
        {
            value: 1,
            label: "100%"
        },
        {
            value: 2,
            label: "200%"
        },
        {
            value: 5,
            label: "500%"
        },
        {
            value: 10,
            label: "1000%"
        }
    ];
    private scalingValue: number = 1;

    private formatValues: string[] = ["SVG", "PNG"];
    private formatValue: string = "SVG";

    @Watch("value")
    private valueChanged() {
        this.downloadDialogOpen = this.value;
    }

    @Watch("downloadDialogOpen")
    private async onDownloadDialogOpenChanged() {
        if (this.downloadDialogOpen !== this.value) {
            this.$emit("input", this.downloadDialogOpen)
        }

        if (this.downloadDialogOpen) {
            // Process the thumbnail images
            this.preparingImage = true;

            if (!this.svgString) {
                this.formatValues = ["PNG"];
                this.formatValue = "PNG";
            } else {
                this.formatValues = ["SVG", "PNG"];
                this.formatValue = "SVG";
            }

            this.resolutionWidth = this.pngSource.getOriginalWidth();
            this.resolutionHeight = this.pngSource.getOriginalHeight();
            this.pngDataURL = await this.pngSource.toDataUrl(1);

            this.preparingImage = false;
        }
    }

    async saveImage() {
        if (this.formatValue === "SVG") {
            await this.saveSVG();
        } else if (this.formatValue === "PNG") {
            await this.savePNG();
        }
    }


    private async saveSVG(): Promise<void> {
        await NetworkUtils.downloadDataByForm(this.svgString, this.baseFileName + ".svg", "image/svg+xml");
    }

    private async savePNG(): Promise<void> {
        const resizedPngDataUrl = await this.pngSource.toDataUrl(this.scalingValue);
        return NetworkUtils.downloadDataByLink(resizedPngDataUrl, this.baseFileName + ".png")
    }
}
</script>

<style scoped>
</style>
