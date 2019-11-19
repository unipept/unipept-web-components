<template>
    <div id="treemapWrapper" ref="treemapWrapper" style="height: 100%;">
        <h2 class="ghead">
            <span class="dir">
                <v-btn x-small fab @click="reset()" :elevation="0"><v-icon>mdi-restore</v-icon></v-btn>
            </span>
            <span class="dir text">Click a square to zoom in and right click to zoom out</span>
        </h2>
        <div v-once ref="visualization"></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import MpaAnalysisManager from "../../logic/data-management/MpaAnalysisManager";
import Tree from "../../logic/data-management/Tree";
import { tooltipContent } from "./VisualizationHelper";
import VisualizationMixin from "./VisualizationMixin.vue";
import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
import { TaxumRank } from "../../logic/data-source/TaxumRank";
import DataRepository from "../../logic/data-source/DataRepository";

@Component
export default class TreemapVisualization extends mixins(VisualizationMixin) {
    // Make field non-reactive by not setting the value here, but only after created() has been fired.
    treemap!: any;

    @Prop({ default: false }) 
    private fullScreen: boolean;
    @Prop({ required: true })
    private dataRepository: DataRepository;
    @Prop({ required: false, default: -1 })
    private width: number;
    @Prop({ required: false, default: 600 })
    private height: number;
    @Prop({ required: false, default: 28 })
    private levels: number;

    mounted() {
        this.initTreeMap();
    }

    @Watch("dataset") onDatasetChanged() {
        this.initTreeMap();
    }

    @Watch("watchableTaxonId") onWatchableTaxonIdChanged() {
        if (this.watchableTaxonId === -1) {
            this.reset();
        }
    }

    @Watch("fullScreen")
    private onFullScreenChanged(isFullScreen: boolean) {
        this.treemap.setFullScreen(isFullScreen);
    }

    reset() {
        if (this.treemap) {
            this.treemap.reset();
        }
    }

    private async initTreeMap() {
        if (this.dataRepository != null) {
            let taxaSource: TaxaDataSource = await this.dataRepository.createTaxaDataSource();
            let tree: Tree = await taxaSource.getTree();
            const data = JSON.stringify(tree.getRoot());

            // @ts-ignore
            this.treemap = $(this.$refs.visualization).treemap(JSON.parse(data), {
                width: this.width === -1 ? (this.$refs.treemapWrapper as Element).clientWidth : this.width,
                height: this.height,
                levels: this.levels,
                getBreadcrumbTooltip: d => d.rank,
                getTooltip: tooltipContent,
                getLabel: d => `${d.name} (${d.data.self_count}/${d.data.count})`,
                getLevel: d => Object.values(TaxumRank).indexOf(d.rank),
                rerootCallback: d => this.search(d.id, d.name, 1000)
            });
        }
    }
}
</script>

<style lang="less" scoped>
    @import './../../assets/style/visualizations.css.less';
</style>