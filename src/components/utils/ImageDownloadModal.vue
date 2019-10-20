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
                :src="pngDataURL"
            />
            <v-card-actions class="justify-center">
                <v-btn v-if="svgDownload" @click="downloadSVG()" id="download-svg-btn" color="primary"><v-icon left>mdi-download</v-icon>Download as SVG</v-btn>
                <v-btn @click="downloadPNG()" id="download-png-btn" color="primary"><v-icon left>mdi-download</v-icon>Download as PNG</v-btn>
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
    import Component, {mixins} from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {dom2pngDataURL, svg2svgDataURL, downloadDataByLink} from "../../logic/utils";

    @Component
    export default class ImageDownloadModal extends Vue 
    {
        private downloadDialogOpen: boolean = false;
        private preparingImage: boolean = false;

        private svgDownload: boolean = false;

        private baseFileName: string = "";

        private svgDataURL: string = "";
        private pngDataURL: string = "";

        async download(baseFileName, canvasSelector, svgSelector=undefined)
        {
            this.svgDownload = false;

            this.baseFileName = baseFileName;
            this.preparingImage = true;
            this.downloadDialogOpen = true;

            if(svgSelector)
            {
                this.svgDataURL = await svg2svgDataURL(svgSelector);
                this.svgDownload = true;
            }
            
            this.pngDataURL = await dom2pngDataURL(canvasSelector);
            
            this.preparingImage = false;
        }

        private async downloadPNG()
        {
            downloadDataByLink(this.pngDataURL, this.baseFileName + ".png")
        }

        private async downloadSVG()
        {
            downloadDataByLink(this.svgDataURL, this.baseFileName + ".svg")
        }
    }
</script>

<style scoped>
</style>
