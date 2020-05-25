-<template>
    <fullscreen ref="fullScreenContainer" @change="fullScreenChange">
        <v-card style="overflow: hidden; min-height: 100%;" :class="{'full-screen': isFullScreen, 'full-screen-container': true}">
            <v-tabs :slider-color="isFullScreen ? 'white' : tabsSliderColor" :dark="isDark" :background-color="tabsColor" :fixed-tabs="isFullScreen" v-model="tab">
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
                <v-tab v-if="!isFullScreen">
                    Heatmap
                </v-tab>
                <v-spacer>
                </v-spacer>
                <v-menu v-if="!isFullScreen && this.tab < 3" bottom left :disabled="!this.peptideCountTable">
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
                        <v-list-item key="save-as-image" @click="prepareImage()">
                            <v-list-item-title>
                                <v-icon>
                                    mdi-download
                                </v-icon>
                                Save as image
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <div v-if="isFullScreen" class="fullscreen-buttons-container">
                    <v-btn icon text @click="reset()">
                        <v-icon color="white">
                            mdi-restore
                        </v-icon>
                    </v-btn>
                    <v-btn icon text @click="prepareImage()">
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
                        <sunburst-visualization
                            ref="sunburst"
                            :autoResize="true"
                            :full-screen="isFullScreen"
                            v-if="tree"
                            :tree="tree"
                            v-on:update-selected-term="onUpdateSelectedTerm"
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
                    <image-download-modal ref="imageDownloadModal" />
                </v-tab-item>
                <v-tab-item>
                    <v-card flat>
                        <treemap-visualization
                            ref="treemap"
                            :full-screen="isFullScreen"
                            v-if="tree"
                            :tree="tree"
                            v-on:update-selected-term="onUpdateSelectedTerm"
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
                            :width="600"
                            :height="350"
                            :full-screen="isFullScreen"
                            v-if="tree"
                            :tree="tree"
                            v-on:update-selected-term="onUpdateSelectedTerm"
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
                                v-on:update-selected-term="onUpdateSelectedTerm"
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
                        <heatmap-wizard-single-sample
                            v-if="peptideCountTable"
                            :communication-source="communicationSource"
                            :peptide-count-table="peptideCountTable"
                            :search-configuration="searchConfiguration">
                        </heatmap-wizard-single-sample>
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
    </fullscreen>
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
import fullscreen from "vue-fullscreen";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import { CountTable } from "./../../business/counts/CountTable";
import Tree from "./../../business/ontology/taxonomic/Tree";
import NcbiOntologyProcessor from "./../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import LcaCountTableProcessor from "./../../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import AnalyticsUtil from "./../../business/analytics/AnalyticsUtil";
import CommunicationSource from "./../../business/communication/source/CommunicationSource";


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
        fullScreenContainer: fullscreen,
        sunburst: SunburstVisualization,
        treeview: TreeviewVisualization,
        treemap: TreemapVisualization,
        heatmap: HeatmapVisualization,
        imageDownloadModal: ImageDownloadModal
    }

    @Prop({ required: true })
    private peptideCountTable: CountTable<Peptide>;
    @Prop({ required: true })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;
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

    private tree: Tree = null;

    private tab = null;

    private readonly tabs: string[] = ["Sunburst", "Treemap", "Treeview", "Hierarchical outline", "Heatmap"];

    private async mounted() {
        await this.onPeptideCountTableChanged();
    }

    @Watch("peptideCountTable")
    @Watch("communicationSource")
    private async onPeptideCountTableChanged() {
        this.tree = null;
        if (this.peptideCountTable && this.communicationSource) {
            const taxaCountProcessor = new LcaCountTableProcessor(this.peptideCountTable, this.searchConfiguration, this.communicationSource);
            const taxaCounts = await taxaCountProcessor.getCountTable();

            const taxaOntologyProcessor = new NcbiOntologyProcessor(this.communicationSource);
            const taxaOntology = await taxaOntologyProcessor.getOntology(taxaCounts);

            this.tree = new Tree(taxaCounts, taxaOntology, await taxaCountProcessor.getAnnotationPeptideMapping());
        }
    }

    private switchToFullScreen() {
        // @ts-ignore
        if (!this.isFullScreen && window.fullScreenApi.supportsFullScreen) {
            this.isFullScreen = true;
            this.$refs.fullScreenContainer.enter();
            // @ts-ignore
            AnalyticsUtil.logToGoogle("Multi Peptide", "Full Screen", this.tabs[this.tab]);
            $(".tip").appendTo(".full-screen-container");
        }
    }

    private exitFullScreen() {
        this.isFullScreen = false;
        this.$refs.fullScreenContainer.exit();
        $(".tip").appendTo("body");
    }

    private fullScreenChange(state: boolean) {
        if (!state) {
            this.exitFullScreen();
        } else {
            this.switchToFullScreen();
        }
    }

    private async prepareImage() {
        this.exitFullScreen();
        const imageDownloadModal = this.$refs.imageDownloadModal as ImageDownloadModal;

        AnalyticsUtil.logToGoogle("Multi Peptide", "Save Image", this.tabs[this.tab]);
        if (this.tabs[this.tab] === "Sunburst") {
            d3.selectAll(".toHide").attr("class", "arc hidden");
            await imageDownloadModal.downloadSVG("unipept_sunburst", "#sunburstWrapper > .unipept-sunburst > svg")
            d3.selectAll(".hidden").attr("class", "arc toHide");
        } else if (this.tabs[this.tab] === "Treemap") {
            await imageDownloadModal.downloadPNG("unipept_treemap", "#treemapWrapper > div")
        } else {
            await imageDownloadModal.downloadSVG("unipept_treeview", "#treeviewWrapper svg")
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

    private onUpdateSelectedTerm(searchTerm: string): void {
        /**
         * Fired after the user indicated that he somehow wants to filter the currently visible results.
         *
         * @event update-selected-term
         * @property {string} searchTerm The search term that was used by the user to filter.
         */
        this.$emit("update-selected-term", searchTerm);
    }

    private onUpdateSelectedTaxonId(id: string): void {
        /**
         * Fired after the user indicated that he somehow wants to filter the currently visible results in the
         * application.
         *
         * @event update-selected-taxon-id
         * @property {string} id The id of the taxon to which results should be restricted. Note that alle taxa
         * that are (both direct and indirect) children of this taxon should also be present in the filtering.
         */
        this.$emit("update-selected-taxon-id", id);
    }
}
</script>

<style scoped lang="css">
    @import './../../assets/style/placeholder.css.less';

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
