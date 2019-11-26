<template>
    <v-dialog v-model="downloadDialogOpen" max-width="800">
        <v-card v-if="preparingImage">
            <v-card-title>
                Please wait while we are preparing your image
            </v-card-title>
            <v-card-text>
                Loading preview...
                <v-progress-linear indeterminate rounded/>
            </v-card-text>
        </v-card>
        <v-card v-else>
            <v-img
                class="white--text align-end"
                max-height="600px"
                min-height="200px"
                :src="pngDataURL" />
            <v-card-actions class="justify-center">
                <v-btn v-if="svgDownload" @click="saveSVG()" id="download-svg-btn" color="primary"><v-icon left>mdi-download</v-icon>Download as SVG</v-btn>
                <v-btn @click="savePNG()" id="download-png-btn" color="primary"><v-icon left>mdi-download</v-icon>Download as PNG</v-btn>
            </v-card-actions>
            <v-divider/>
            <v-card-text>
                <br>
                If you use this figure in a publication, please cite: <br>
                Mesuere et al. (2015) Proteomics <a href="https://doi.org/10.1002/pmic.201400361" target="_blank">doi:10.1002/pmic.201400361</a>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { dom2pngDataURL, svg2svgDataURL, svg2pngDataURL, downloadDataByLink } from "../../logic/utils";

@Component
export default class ImageDownloadModal extends Vue {
    private downloadDialogOpen: boolean = false;
    private preparingImage: boolean = false;

    private svgDownload: boolean = false;

    private baseFileName: string = "";

    private svgDataURL: string = "";
    private pngDataURL: string = "";

    async downloadSVG(baseFileName, selector) {
        this.svgDownload = true;
        this.baseFileName = baseFileName;

        this.preparingImage = true;
        this.downloadDialogOpen = true;

        this.svgDataURL = await svg2svgDataURL(selector);
        this.pngDataURL = await svg2pngDataURL(selector);

        this.preparingImage = false;
    }

    async downloadPNG(baseFileName, selector) {
        this.baseFileName = baseFileName;

        this.preparingImage = true;
        this.downloadDialogOpen = true;

        this.pngDataURL = await dom2pngDataURL(selector);

        this.preparingImage = false;
    }

    private async savePNG() {
        downloadDataByLink(this.pngDataURL, this.baseFileName + ".png")
    }

    private async saveSVG() {
        downloadDataByLink(this.svgDataURL, this.baseFileName + ".svg")
    }
}
</script>

<style scoped>
</style>
