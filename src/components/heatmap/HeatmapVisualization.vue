<template>
    <div style="width: 100%;">
        <h2 class="ghead">
            <span class="dir">
                <v-btn x-small fab @click="rotate()" :elevation="0"><v-icon>mdi-format-rotate-90</v-icon></v-btn>
                <v-btn x-small fab @click="download()" :elevation="0"><v-icon>mdi-download</v-icon></v-btn>
                <v-btn x-small fab @click="reset()" :elevation="0"><v-icon>mdi-restore</v-icon></v-btn>
            </span>
            <span class="dir text">Scroll to zoom, drag to pan.</span>
        </h2>
        <div ref="heatmapElement" style="width: 100%" v-once></div>
        <image-download-modal ref="imageDownloadModal" />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import VisualizationMixin from "../visualizations/VisualizationMixin.vue";
import { Heatmap, HeatmapSettings } from "unipept-heatmap";
import ImageDownloadModal from "./../utils/ImageDownloadModal.vue";
import AnalyticsUtil from "@/business/analytics/AnalyticsUtil";

@Component({
    components: {
        ImageDownloadModal
    }
})
export default class HeatmapVisualization extends mixins(VisualizationMixin) {
    $refs: {
        heatmapElement: any,
        imageDownloadModal: ImageDownloadModal
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

    mounted() {
        this.initHeatmap();
    }

    reset() {
        if (this.heatmap){
            this.heatmap.reset();
        }
    }

    @Watch("fullScreen") onFullScreenChanged(newFullScreen: boolean, oldFullScreen: boolean) {
        this.heatmap.setFullScreen(newFullScreen)
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

            //@ts-ignore
            this.heatmap = new Heatmap(heatmapElement, data, rows, columns, {
                width: heatmapElement.clientWidth,
                height: 600
            });

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
        const imageDownloadModal = this.$refs.imageDownloadModal as ImageDownloadModal;
        await imageDownloadModal.downloadPNG(
            "unipept_comparative_heatmap",
            document.getElementsByTagName("canvas").item(0)
        );
    }
}
</script>

<style scoped>
</style>
