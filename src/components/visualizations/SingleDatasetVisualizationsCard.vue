<template>
    <v-card style="overflow: hidden; min-height: 100%;" >
        <v-tabs :slider-color="tabsSliderColor" :dark="isDark" :background-color="tabsColor" v-model="tab">
            <v-tab>
                Sunburst
            </v-tab>
            <v-tab>
                Treemap
            </v-tab>
            <v-tab>
                Treeview
            </v-tab>
            <v-tab>
                Hierarchical Outline
            </v-tab>
            <v-tab>
                Heatmap
            </v-tab>

            <v-spacer>
            </v-spacer>

            <div style="padding-right: 16px;" class="d-flex align-center">
                <v-btn depressed @click="prepareImage" color="primary">
                    <v-icon>mdi-download</v-icon>
                    Save as image
                </v-btn>
            </div>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-tab-item>
                <v-card flat>
                    <sunburst-visualization
                        ref="sunburst"
                        :autoResize="true"
                        :full-screen="isFullScreen"
                        v-if="tree"
                        :tree="tree"
                        v-on:update-selected-taxon-id="onUpdateSelectedTaxonId">
                    </sunburst-visualization>
                    <div v-else-if="this.analysisInProgress" class="mpa-waiting">
                        <v-progress-circular :size="70" :width="7" color="primary" indeterminate>
                        </v-progress-circular>
                    </div>
                    <div v-else>
                        <v-card-text>
                            <div class="placeholder-text">
                                {{ placeholderText }}
                            </div>
                        </v-card-text>
                    </div>
                </v-card>
                <image-download-modal
                    :base-file-name="imageBaseName"
                    :svg-string="svgImageData"
                    :png-source="pngSource"
                    v-model="downloadImageDialogOpen"
                />
            </v-tab-item>
            <v-tab-item>
                <v-card flat>
                    <treemap-visualization
                        ref="treemap"
                        :full-screen="isFullScreen"
                        v-if="tree"
                        :tree="tree"
                        v-on:update-selected-taxon-id="onUpdateSelectedTaxonId">
                    </treemap-visualization>
                    <div v-else-if="this.analysisInProgress" class="mpa-waiting">
                        <v-progress-circular :size="70" :width="7" color="primary" indeterminate>
                        </v-progress-circular>
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
                    <treeview-visualization
                        ref="treeview"
                        :autoResize="true"
                        :height="500"
                        :full-screen="isFullScreen"
                        v-if="tree"
                        :tree="tree"
                        v-on:update-selected-taxon-id="onUpdateSelectedTaxonId">
                    </treeview-visualization>
                    <div v-else-if="this.analysisInProgress" class="mpa-waiting">
                        <v-progress-circular :size="70" :width="7" color="primary" indeterminate>
                        </v-progress-circular>
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
                        <hierarchical-outline-visualization
                            v-if="tree"
                            :tree="tree"
                            :search-configuration="searchConfiguration"
                            v-on:update-selected-taxon-id="onUpdateSelectedTaxonId">
                        </hierarchical-outline-visualization>
                        <div v-else-if="this.analysisInProgress" class="mpa-waiting">
                            <v-progress-circular :size="70" :width="7" color="primary" indeterminate>
                            </v-progress-circular>
                        </div>
                        <div v-else>
                            <div class="placeholder-text">
                                {{ placeholderText }}
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-tab-item>
            <v-tab-item>
                <v-card flat>
                    <heatmap-wizard-single-sample v-if="assay" :assay="assay"></heatmap-wizard-single-sample>
                    <div v-else-if="this.analysisInProgress" class="mpa-waiting">
                        <v-progress-circular :size="70" :width="7" color="primary" indeterminate>
                        </v-progress-circular>
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
        </v-tabs-items>
    </v-card>
</template>

<script lang="ts">
import * as d3 from "d3";
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import SunburstVisualization from "./SunburstVisualization.vue";
import TreemapVisualization from "./TreemapVisualization.vue";
import TreeviewVisualization from "./TreeviewVisualization.vue";
import HeatmapVisualization from "../heatmap/HeatmapVisualization.vue";
import HierarchicalOutlineVisualization from "./HierarchicalOutlineVisualization.vue";
import HeatmapWizardSingleSample from "../heatmap/HeatmapWizardSingleSample.vue";
import ImageDownloadModal from "../utils/ImageDownloadModal.vue";
import $ from "jquery";
import CardHeader from "../custom/CardHeader.vue";

//@ts-ignore
import { Peptide } from "./../../business/ontology/raw/Peptide";
import { CountTable } from "./../../business/counts/CountTable";
import Tree from "./../../business/ontology/taxonomic/Tree";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import AnalyticsUtil from "./../../business/analytics/AnalyticsUtil";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";
import PngSource from "@/business/image/PngSource";
import SvgUtils from "@/business/image/SvgUtils";
import SvgElementToPngSource from "@/business/image/SvgElementToPngSource";
import DomElementToPngSource from "@/business/image/DomElementToPngSource";


@Component({
    components: {
        HeatmapVisualization,
        CardHeader,
        HierarchicalOutlineVisualization,
        TreeviewVisualization,
        TreemapVisualization,
        SunburstVisualization,
        HeatmapWizardSingleSample,
        ImageDownloadModal
    }
})
export default class SingleDatasetVisualizationsCard extends Vue {
    $refs!: {
        sunburst: SunburstVisualization,
        treeview: TreeviewVisualization,
        treemap: TreemapVisualization,
        heatmap: HeatmapVisualization,
        imageDownloadModal: ImageDownloadModal
    }

    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: false, default: true })
    private analysisInProgress: boolean;
    @Prop({ required: false, default: "primary" })
    private tabsColor: string;
    @Prop({ required: false, default: "secondary" })
    private tabsSliderColor: string;
    @Prop({ required: false, default: "white" })
    private tabsTextColor: string;
    @Prop({ required: false, default: true })
    private isDark: boolean;

    private placeholderText = "Please select at least one assay for analysis.";
    private isFullScreen: boolean = false;
    private dialogOpen: boolean = false;

    private svgImageData: string = "";
    private pngSource: PngSource = null;
    private imageBaseName: string = "";
    private downloadImageDialogOpen: boolean = false;

    private tab = null;

    private readonly tabs: string[] = ["Sunburst", "Treemap", "Treeview", "Hierarchical outline", "Heatmap"];

    get peptideCountTable(): CountTable<Peptide> {
        return this.$store.getters.assayData(this.assay)?.peptideCountTable;
    }

    get tree(): Tree {
        return this.$store.getters["ncbi/tree"](this.assay);
    }

    get searchConfiguration(): SearchConfiguration {
        return this.assay?.getSearchConfiguration();
    }

    private async prepareImage() {
        AnalyticsUtil.logToGoogle("Multi Peptide", "Save Image", this.tabs[this.tab]);
        if (this.tabs[this.tab] === "Sunburst") {
            d3.selectAll(".toHide").attr("class", "arc hidden");
            const svgElements = document
                .getElementById("sunburstWrapper")
                .getElementsByClassName("unipept-sunburst")
                .item(0)
                .getElementsByTagName("svg");
            const svgElement = svgElements
                .item(svgElements.length - 1);
            this.svgImageData = SvgUtils.elementToSvgDataUrl(svgElement);
            this.pngSource = new SvgElementToPngSource(svgElement);
            this.imageBaseName = "unipept_sunburst";
            this.downloadImageDialogOpen = true;
            d3.selectAll(".hidden").attr("class", "arc toHide");
        } else if (this.tabs[this.tab] === "Treemap") {
            this.svgImageData = "";
            const domElement = document
                .getElementById("treemapWrapper")
                .getElementsByTagName("div")
                .item(0);
            this.pngSource = new DomElementToPngSource(domElement);
            this.imageBaseName = "unipept_treemap";
            this.downloadImageDialogOpen = true;
        } else {
            const svgElement = document
                .getElementById("treeviewWrapper")
                .getElementsByTagName("svg")
                .item(0);
            this.svgImageData = SvgUtils.elementToSvgDataUrl(svgElement);
            this.pngSource = new SvgElementToPngSource(svgElement);
            this.imageBaseName = "unipept_treeview";
            this.downloadImageDialogOpen = true;
        }
    }

    private reset() {
        (this.$refs.sunburst as SunburstVisualization).reset();
        (this.$refs.treeview as TreeviewVisualization).reset();
        (this.$refs.treemap as TreemapVisualization).reset();
        (this.$refs.heatmap as HeatmapVisualization).reset();
    }

    private openHeatmapWizard(): void {
        this.dialogOpen = true;
    }

    private onUpdateSelectedTaxonId(id: string): void {
        this.$store.dispatch("filterByTaxon", [this.assay, id]);
    }
}
</script>

<style scoped lang="less">
    /*@import './../../assets/style/placeholder.css.less';*/

    .mpa-waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
    }

    .fullscreen-buttons-container {
        display: flex;
        align-items: center;
    }

    .full-screen-container .tip {
        position: relative;
        top: -300px;
    }
</style>
