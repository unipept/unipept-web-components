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
            <v-card-title class="justify-center">
                Your image is ready
            </v-card-title>
            <v-card-actions class="justify-center">
                <v-btn id="download-svg-btn" color="primary"><v-icon left>mdi-download</v-icon>Download as SVG</v-btn>
                <v-btn id="download-png-btn" color="primary"><v-icon left>mdi-download</v-icon>Download as PNG</v-btn>
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

    @Component
    export default class ImageDownloadModal extends Vue 
    {
        private downloadDialogOpen: boolean = false;
        private preparingImage: boolean = false;

        downloadSVG(baseFileName, svgSelector)
        {
            this.preparingImage = true;
            this.downloadDialogOpen = true;
        }

        downloadCanvas(baseFileName, canvasSelector)
        {
            this.preparingImage = true;
            this.downloadDialogOpen = true;
        }
    }
</script>

<style scoped>
</style>
