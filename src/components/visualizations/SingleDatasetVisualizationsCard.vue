<template>
    <fullscreen ref="fullScreenContainer" @change="fullScreenChange">
        <v-card style="overflow: hidden; min-height: 100%;" :class="{'full-screen': isFullScreen, 'full-screen-container': true}">
            <v-tabs :color="isFullScreen ? 'accent' : 'primary'" :slider-color="isFullScreen ? 'white' : 'secondary'" dark background-color="accent" :fixed-tabs="isFullScreen" v-model="tab">
                <div v-if="isFullScreen" class="unipept-logo">
                    <img src="/images/trans_logo.png" alt="logo" width="40" height="40">
                </div>
                <v-tab>
                    Sunburst
                </v-tab>
                <v-tab>
                    Treemap
                </v-tab>
                <v-tab>
                    Treeview
                </v-tab>
                <v-tab v-if="!isFullScreen">
                    Hierarchical Outline
                </v-tab>
                <v-tab v-if="!isFullScreen" @click="openHeatmapWizard()" v-on:click.stop>
                    Heatmap
                </v-tab>
                <v-spacer>
                </v-spacer>
                <v-menu v-if="!isFullScreen && this.tab < 3" bottom left :disabled="!this.dataRepository">
                    <template v-slot:activator="{ on }">
                        <v-btn text class="align-self-center mr-4" v-on="on">
                            More
                            <v-icon right>mdi-menu-down</v-icon>
                        </v-btn>
                    </template>

                    <v-list class="grey lighten-3">
                        <v-list-item key="enter-full-screen" @click="switchToFullScreen()" >
                            <v-list-item-title>
                                <v-icon>
                                    mdi-fullscreen
                                </v-icon>
                                Enter full screen
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item key="save-as-image" @click="downloadDialogOpen = true">
                            <v-list-item-title>
                                <v-icon>
                                    mdi-download
                                </v-icon>
                                Save as image
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
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
                            <v-btn color="primary"><v-icon left>mdi-download</v-icon>Download as SVG</v-btn>
                            <v-btn color="primary"><v-icon left>mdi-download</v-icon>Download as PNG</v-btn>
                        </v-card-actions>
                        <v-divider/>
                        <v-card-text>
                            <br>
                            If you use this figure in a publication, please cite: <br>
                            Mesuere et al. (2015) Proteomics <a href="https://doi.org/10.1002/pmic.201400361" target="_blank">doi:10.1002/pmic.201400361</a>
                        </v-card-text>
                    </v-card>
                </v-dialog>
                <div v-if="isFullScreen">
                    <v-btn icon text @click="reset()">
                        <v-icon color="white">
                            mdi-restore
                        </v-icon>
                    </v-btn>
                    <v-btn icon text @click="saveAsImage()">
                        <v-icon color="white">
                            mdi-download
                        </v-icon>
                    </v-btn>
                    <v-btn icon text @click="exitFullScreen()">
                        <v-icon color="white">
                            mdi-fullscreen-exit
                        </v-icon>
                    </v-btn>
                </div>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item>
                    <v-card flat>
                        <sunburst-visualization ref="sunburst" :full-screen="isFullScreen" class="unipept-sunburst" v-if="this.dataRepository" :dataRepository="this.dataRepository"></sunburst-visualization>
                        <div v-else-if="this.analysisInProgress" class="mpa-waiting">
                            <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                        </div>
                        <div v-else>
                            <v-card-text>
                                <div class="placeholder-text">
                                    {{ placeholderText }}
                                </div>
                            </v-card-text>
                        </div>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card flat>
                        <treemap-visualization ref="treemap" id="treemap" :full-screen="isFullScreen" v-if="this.dataRepository" :dataRepository="this.dataRepository"></treemap-visualization>
                        <div v-else-if="this.analysisInProgress" class="mpa-waiting">
                            <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                        </div>
                        <div v-else>
                            <v-card-text>
                                <div class="placeholder-text">
                                    {{ placeholderText }}
                                </div>
                            </v-card-text>
                        </div>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card flat>
                        <treeview-visualization ref="treeview" :full-screen="isFullScreen" v-if="this.dataRepository" :dataRepository="this.dataRepository"></treeview-visualization>
                        <div v-else-if="this.analysisInProgress" class="mpa-waiting">
                            <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                        </div>
                        <div v-else>
                            <v-card-text>
                                <div class="placeholder-text">
                                    {{ placeholderText }}
                                </div>
                            </v-card-text>
                        </div>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card flat>
                        <v-card-text>
                            <hierarchical-outline-visualization v-if="this.dataRepository" :dataRepository="this.dataRepository"></hierarchical-outline-visualization>
                            <div v-else-if="this.analysisInProgress" class="mpa-waiting">
                                <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                            </div>
                            <div v-else>
                                <div class="placeholder-text">
                                    {{ placeholderText }}
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
            <template v-for="dataset of $store.getters.selectedDatasets">
                <v-dialog v-model="dialogOpen" width="1000px" :key="dataset.id" v-if="dataset && $store.getters.activeDataset && dataset.id === $store.getters.activeDataset.id">
                    <div style="min-height: 600px; background-color: white;">
                        <div class="modal-header">
                            <button type="button" class="close" @click="dialogOpen = false"><span aria-hidden="true">×</span></button>
                            <h4 class="modal-title">Heatmap wizard</h4>
                        </div>
                        <div class="single-dataset-wizard">
                            <heatmap-wizard-single-sample v-if="dataset" :dataset="dataset"></heatmap-wizard-single-sample>
                            <div v-else>
                                <div class="text-xs-center" style="margin-top: 25px;">
                                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                </div>
                            </div>
                        </div>
                    </div>
                </v-dialog>
            </template>
        </v-card>
    </fullscreen>
</template>

<script lang="ts">
    import d3 from "d3";
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import SunburstVisualization from "./SunburstVisualization.vue";
    import TreemapVisualization from "./TreemapVisualization.vue";
    import TreeviewVisualization from "./TreeviewVisualization.vue";
    import HeatmapVisualization from "../heatmap/HeatmapVisualization.vue";
    import HierarchicalOutlineVisualization from "./HierarchicalOutlineVisualization.vue";

    import CardHeader from "../custom/CardHeader.vue";
    //@ts-ignore
    import fullscreen from 'vue-fullscreen';

    import {logToGoogle, triggerDownloadModal} from "../../logic/utils";
    import HeatmapWizardSingleSample from "../heatmap/HeatmapWizardSingleSample.vue";
    import DataRepository from '../../logic/data-source/DataRepository';
    import $ from 'jquery';

    @Component({
        components: {
            HeatmapVisualization,
            CardHeader,
            HierarchicalOutlineVisualization,
            TreeviewVisualization,
            TreemapVisualization,
            SunburstVisualization,
            HeatmapWizardSingleSample
        }
    })
    export default class SingleDatasetVisualizationsCard extends Vue {
        $refs!: {
            fullScreenContainer: fullscreen,
            sunburst: SunburstVisualization,
            treeview: TreeviewVisualization,
            treemap: TreemapVisualization,
            heatmap: HeatmapVisualization
        }

        @Prop({required: true})
        private dataRepository: DataRepository;
        @Prop({required: false, default: true})
        private analysisInProgress: boolean;

        private placeholderText = "Please select at least one dataset for analysis.";
        private isFullScreen: boolean = false;
        private dialogOpen: boolean = false;

        private downloadDialogOpen: boolean = false;
        private preparingImage: boolean = false;

        private tab = null;

        private readonly tabs: string[] = ["Sunburst", "Treemap", "Treeview", "Hierarchical outline", "Heatmap"];

        mounted() {
            document.addEventListener('fullscreenchange', () => {
                if (document.fullscreenElement) {
                    this.exitFullScreen();
                }
            }, false);
            // @ts-ignore (TODO: migrate to Vuetify)
            // $(".fullScreenActions a").tooltip({placement: "bottom", delay: {"show": 300, "hide": 300}});
        }
        
        private switchToFullScreen() {
            // @ts-ignore
            if (window.fullScreenApi.supportsFullScreen) {
                this.isFullScreen = true;
                this.$refs.fullScreenContainer.toggle();
                // @ts-ignore
                logToGoogle("Multi Peptide", "Full Screen", this.tabs[this.tab]);
                $(".tip").appendTo(".full-screen-container");
            }
        }

        private exitFullScreen() {
            this.isFullScreen = false;
            this.$refs.fullScreenContainer.toggle();
            $(".tip").appendTo("body");
        }

        private fullScreenChange(state: boolean) {
            this.isFullScreen = state;
        }

        private reset() {
            (this.$refs.sunburst as SunburstVisualization).reset();
            (this.$refs.treeview as TreeviewVisualization).reset();
            (this.$refs.treemap as TreemapVisualization).reset();
            (this.$refs.heatmap as HeatmapVisualization).reset();
        }

        private saveAsImage() {
            // @ts-ignore
            logToGoogle("Multi Peptide", "Save Image", this.tabs[this.tab]);
            if (this.tabs[this.tab] === "Sunburst") {
                d3.selectAll(".toHide").attr("class", "arc hidden");
                triggerDownloadModal("#sunburstWrapper svg", null, "unipept_sunburst");
                d3.selectAll(".hidden").attr("class", "arc toHide");
            } else if (this.tabs[this.tab] === "Treemap") {
                triggerDownloadModal(null, "#treemap", "unipept_treemap");
            } else {
                triggerDownloadModal("#treeviewWrapper svg", null, "unipept_treeview");
            }
        }

        private openHeatmapWizard(): void {
            this.dialogOpen = true;
        }
    }
</script>

<style scoped lang="css">
    @import './../../assets/style/placeholder.css.less';

    .mpa-waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        position: relative;
        left: 50%;
        transform: translate(-35px);
    }
    
    /* .fullscreen-nav {
        position: absolute;
        z-index: 1;
        right: 16px;
        top: 16px;
    }

    .unipept-logo {
        z-index: 100;
        position: absolute;
        top: 10px;
        left: 10px;
    }

    .fullScreenButtons {
        position: absolute;
        z-index: 10;
        right: 16px;
        top: 5px;
    } */
</style>
