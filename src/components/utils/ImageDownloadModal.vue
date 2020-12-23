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
            <v-btn icon @click="downloadDialogOpen = false" class="float-right">
                <v-icon>mdi-close</v-icon>
            </v-btn>
            <div class="d-flex justify-center">
                <img :src="pngDataURL" style="max-width: 800px; max-height: 400px;" />
            </div>
            <v-card-actions class="justify-center">
                <v-btn @click="saveSVG()" id="download-svg-btn" color="primary"><v-icon left>mdi-download</v-icon>Download as SVG</v-btn>
                <v-btn @click="savePNG()" id="download-png-btn" color="primary"><v-icon left>mdi-download</v-icon>Download as PNG</v-btn>
            </v-card-actions>
            <v-divider/>
            <v-card-text>
                <br>
                If you use this figure in a publication, please cite:
                <br>
                Mesuere et al. (2015) Proteomics <a href="https://doi.org/10.1002/pmic.201400361" target="_blank">doi:10.1002/pmic.201400361</a>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Canvg, { presets } from "canvg";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import htmlToImage from "html-to-image-no-fonts";
import NetworkUtils from "./../../business/communication/NetworkUtils";

@Component
export default class ImageDownloadModal extends Vue {
    private downloadDialogOpen: boolean = false;
    private preparingImage: boolean = false;

    private svgDownload: boolean = false;

    private baseFileName: string = "";

    private svgDataURL: string = "";
    private pngDataURL: string = "";

    private imageKey: number = 0;

    async downloadSVG(baseFileName, selector) {
        this.svgDownload = true;
        this.baseFileName = baseFileName;

        this.preparingImage = true;
        this.downloadDialogOpen = true;

        this.svgDataURL = await this.svg2svgDataURL(selector);
        this.pngDataURL = await this.svg2pngDataURL(selector);

        this.preparingImage = false;
    }

    async downloadPNG(baseFileName, selector) {
        this.svgDownload = false;
        this.baseFileName = baseFileName;

        this.preparingImage = true;
        this.downloadDialogOpen = true;

        this.pngDataURL =  await this.dom2pngDataURL(selector);
        this.svgDataURL = await htmlToImage.toSvgDataURL($(selector).get(0));

        this.preparingImage = false;
    }

    private async savePNG() {
        NetworkUtils.downloadDataByLink(this.pngDataURL, this.baseFileName + ".png")
    }

    private async saveSVG() {
        NetworkUtils.downloadDataByLink(this.svgDataURL, this.baseFileName + ".svg")
    }


    /**
     * Use canvg to convert an inline svg element to a PNG DataURL
     * @param {string} svgSelector The DOM selector of the SVG or jQuery object
     * @returns {string} A dataURL containing the resulting PNG
    */
    async svg2pngDataURL(svgSelector: string) : Promise<string> {
        const el = $(svgSelector).get(0);

        let canvas;

        if (window.OffscreenCanvas) {
            canvas = new OffscreenCanvas(el.clientWidth, el.clientHeight);
        } else {
            const cnvs = document.createElement("canvas");
            cnvs.width = el.clientWidth;
            cnvs.height = el.clientHeight;

            cnvs["convertToBlob"] = async() => {
                return new Promise(resolve => {
                    cnvs.toBlob(resolve);
                });
            };
            canvas = cnvs;
        }

        // automatically size canvas to svg element and render
        const canvgInstance = await Canvg.from(canvas.getContext("2d"), el.outerHTML, presets.offscreen());
        canvgInstance.resize(canvas.width * 4, canvas.height * 4);

        await canvgInstance.render();

        const blob = await canvas.convertToBlob();
        return URL.createObjectURL(blob);
    }

    svg2svgDataURL(svgSelector: string) {
        const el = $(svgSelector).get(0);
        const svgString = new XMLSerializer().serializeToString(el);
        const decoded = unescape(encodeURIComponent(svgString));
        // convert the svg to base64
        const base64 = btoa(decoded);
        return `data:image/svg+xml;base64,${base64}`;
    }

    /**
     * Uses html2canvas to convert canvas to a PNG.
     *
     * @param {string} selector The DOM selector
     * @returns {string} A dataURL containing the resulting PNG
    */
    async dom2pngDataURL(selector: string) : Promise<string> {
        // Use html2canvas to convert selected element to canvas,
        // then convert that canvas to a dataURL
        const element = $(selector).get(0);
        const dataUrl: string = await htmlToImage.toPng(element);
        return dataUrl;
    }
}
</script>

<style scoped>
</style>
