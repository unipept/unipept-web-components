<template>
    <div v-once style="width: 100%;">
        <div ref="heatmapElement" style="width: 100%;"></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { Heatmap } from "unipept-heatmap";


import VisualizationMixin from "../visualizations/VisualizationMixin.vue";

@Component
export default class HeatmapVisualization extends mixins(VisualizationMixin) {
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

    private async onResize() {
        this.initHeatmap();
    }

    private async initHeatmap() {
        if (this.data) {
            let heatmapElement: HTMLElement = this.$refs.heatmapElement as HTMLElement;
            console.log(heatmapElement);
            console.log("Width is now: " + heatmapElement.clientWidth);
            this.heatmap = new Heatmap(heatmapElement, this.data, this.rowLabels, this.columnLabels, {
                width: heatmapElement.clientWidth,
                height: 800
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
}
</script>

<style scoped>
</style>
