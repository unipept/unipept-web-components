<template>
    <fullscreen ref="fullscreen">
        <div style="width: 100%;" class="heatmap-wrapper">
            <h2 class="ghead">
            <span class="dir">
                <v-btn x-small fab @click="rotate()" :elevation="0"><v-icon>mdi-format-rotate-90</v-icon></v-btn>
                <v-btn x-small fab @click="download()" :elevation="0"><v-icon>mdi-download</v-icon></v-btn>
                <v-btn x-small fab @click="reset()" :elevation="0"><v-icon>mdi-restore</v-icon></v-btn>
                <v-btn x-small fab @click="enableFullscreen()" :elevation="0"><v-icon>mdi-fullscreen</v-icon></v-btn>
            </span>
                <span class="dir text">Scroll to zoom, drag to pan.</span>
            </h2>
            <div ref="heatmapElement" style="width: 100%" v-once></div>
            <image-download-modal
                v-model="downloadModalOpen"
                base-file-name="unipept_comparative_heatmap"
                :png-source="pngDataSource"
                :svg-string="svgString"
            />
        </div>
    </fullscreen>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import VisualizationMixin from "../visualizations/VisualizationMixin.vue";
import ImageDownloadModal from "./../utils/ImageDownloadModal.vue";
import AnalyticsUtil from "@/business/analytics/AnalyticsUtil";
import SvgStringToPngSource from "@/business/image/SvgStringToPngSource";
import { Heatmap } from "unipept-visualizations";

@Component({
    components: {
        ImageDownloadModal
    }
})
export default class HeatmapVisualization extends mixins(VisualizationMixin) {
    $refs: {
        heatmapElement: any,
        fullscreen: any
    }

    @Prop({ default: false })
    private fullScreen: false;
    @Prop({ required: true })
    private data: number[][];
    @Prop({ required: true })
    private rowLabels: string[];
    @Prop({ required: true })
    private columnLabels: string[];
    @Prop({ required: false, default: true })
    private clusterRows: boolean;
    @Prop({ required: false, default: true })
    private clusterColumns: boolean;

    private heatmap: Heatmap;
    private rotated: boolean = false;

    private downloadModalOpen: boolean = false;
    private svgString: string = "";
    private pngDataSource: SvgStringToPngSource = null;

    mounted() {
        this.initHeatmap();
    }

    reset() {
        if (this.heatmap){
            this.heatmap.reset();
        }
    }

    @Watch("data")
    private onDataChanged() {
        this.initHeatmap();
    }

    @Watch("clusterRows")
    @Watch("clusterColumns")
    async compute() {
        this.initHeatmap();
    }

    private rotate() {
        this.rotated = !this.rotated;
        this.initHeatmap();
    }

    private async initHeatmap() {
        if (this.data) {
            let heatmapElement: HTMLElement = this.$refs.heatmapElement as HTMLElement;

            const rows = this.rotated ? this.columnLabels : this.rowLabels;
            const columns = this.rotated ? this.rowLabels : this.columnLabels;

            let data;
            if (this.rotated) {
                data = this.data[0].map((_, colIndex) => this.data.map(row => row[colIndex]));
            } else {
                data = this.data;
            }

            this.heatmap = new Heatmap(
                heatmapElement,
                data,
                rows,
                columns,
                // @ts-ignore
                {
                    width: heatmapElement.clientWidth,
                    height: 600,
                    dendrogramEnabled: true
                }
            );

            let clusterType: "all" | "columns" | "rows" | "none" = "all";


            if (this.clusterRows && !this.clusterColumns) {
                clusterType = "rows";
            } else if (!this.clusterRows && this.clusterColumns) {
                clusterType = "columns";
            } else if (!this.clusterRows && !this.clusterColumns) {
                clusterType = "none";
            }
            this.heatmap.cluster(clusterType);
        }
    }

    private async download() {
        AnalyticsUtil.logToGoogle("Comparative analysis", "Save Image", "Heatmap");
        this.svgString = this.heatmap.toSVG()
        this.pngDataSource = new SvgStringToPngSource(this.svgString);

        this.downloadModalOpen = true;
    }

    private async enableFullscreen() {
        this.$refs.fullscreen.toggle();
        if (await this.$refs.fullscreen.getState()) {
            let heatmapElement: HTMLElement = this.$refs.heatmapElement as HTMLElement;
            this.heatmap.resize(heatmapElement.clientWidth, 600);
        } else {
            this.heatmap.resize(window.innerWidth, window.innerHeight);
        }
    }
}
</script>

<style>
    .heatmap-wrapper {
        background: white;
    }

    .fullscreen .heatmap-wrapper {
        height: 100%;
    }
</style>
