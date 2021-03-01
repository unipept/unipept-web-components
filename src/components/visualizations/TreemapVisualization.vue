<template>
    <fullscreen ref="fullscreen">
        <div id="treemapWrapper" ref="treemapWrapper" style="height: 100%;" v-if="active">
            <h2 class="ghead">
                <span class="dir">
                    <v-btn x-small fab @click="enableFullscreen()" :elevation="0">
                        <v-icon>mdi-fullscreen</v-icon>
                    </v-btn>
                </span>
                <span class="dir">
                    <v-btn x-small fab @click="reset()" :elevation="0"><v-icon>mdi-restore</v-icon></v-btn>
                </span>
                <span class="dir text">Click a square to zoom in and right click to zoom out</span>
            </h2>
            <div v-once ref="visualization"></div>
        </div>
        <v-container fluid v-else class="error-container mt-2 d-flex align-center">
            <div class="error-container">
                <v-icon x-large>
                    mdi-alert-circle-outline
                </v-icon>
                <p>
                    You're trying to visualise a very large sample. This will work in most cases, but it could take
                    some time to render. Are you sure you want to <a @click="showVisualization()">continue</a>?
                </p>
            </div>
        </v-container>
    </fullscreen>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { tooltipContent } from "./VisualizationHelper";
import VisualizationMixin from "./VisualizationMixin.vue";
import Tree from "./../../business/ontology/taxonomic/Tree";
import { NcbiRank } from "./../../business/ontology/taxonomic/ncbi/NcbiRank";
import { Treemap } from "unipept-visualizations";

@Component
export default class TreemapVisualization extends mixins(VisualizationMixin) {
    $refs!: {
        fullscreen: any,
        treemapWrapper: any
    }

    // Make field non-reactive by not setting the value here, but only after created() has been fired.
    treemap!: any;

    @Prop({ default: false })
    private fullScreen: boolean;
    @Prop({ required: true })
    private tree: Tree;
    @Prop({ required: false, default: -1 })
    private width: number;
    @Prop({ required: false, default: 600 })
    private height: number;
    @Prop({ required: false, default: 28 })
    private levels: number;

    private active: boolean = true;

    mounted() {
        this.initTreeMap();
    }

    beforeDestroy() {
        const els = document.querySelectorAll(".tip");
        for (const el of els) {
            el.parentNode.removeChild(el);
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

    @Watch("tree")
    private async initTreeMap() {
        if (this.tree != null) {
            if (this.tree.nodes.size > 600) {
                this.active = false;
            } else {
                await this.showVisualization();
            }
        }
    }

    private async showVisualization() {
        this.active = true;

        await this.$nextTick();

        // @ts-ignore
        this.treemap = new Treemap(
            this.$refs.visualization,
            this.tree.getRoot().toDataNodeLike(),
            {
                width: this.width === -1 ? (this.$refs.treemapWrapper as Element).clientWidth : this.width,
                height: this.height,
                levels: this.levels,
                getBreadcrumbTooltip: d => d.extra.rank,
                getTooltipText: tooltipContent,
                getLabel: d => `${d.name} (${d.selfCount}/${d.count})`,
                getLevel: d => Object.values(NcbiRank).indexOf(d.data.extra.rank),
                rerootCallback: d => this.search(d.id, d.name, 1000)
            }
        );
    }

    private enableFullscreen() {
        this.$refs.fullscreen.toggle();
    }
}
</script>

<style lang="less" scoped>
    @import './../../assets/style/visualizations.css.less';

    .error-container {
        max-width: 600px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
    }

    #treemapWrapper {
        background: white;
    }


</style>
