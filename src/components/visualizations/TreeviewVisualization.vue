<template>
    <fullscreen ref="fullscreen">
        <div id="treeviewWrapper" ref="treeviewWrapper" style="height: 100%;">
            <h2 class="ghead">
                <span class="dir">
                    <v-btn x-small fab @click="enableFullscreen()" :elevation="0">
                        <v-icon>mdi-fullscreen</v-icon>
                    </v-btn>
                </span>
                <span class="dir">
                    <v-btn x-small fab @click="reset()" :elevation="0"><v-icon>mdi-restore</v-icon></v-btn>
                </span>
                <span class="dir text">
                    Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root
                </span>
            </h2>
            <treeview
                ref="treeview"
                :data="data"
                :autoResize="autoResize"
                :width="width"
                :height="height"
                :enableAutoExpand="true"
                :tooltip="tooltipFunction"
                :colors="colors"
                :rerootCallback="rerootCallback"
            >
            </treeview>
        </div>
    </fullscreen>
</template>

<script lang="ts">
import * as d3 from "d3";
import * as d3Scale from "d3-scale";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { tooltipContent } from "./VisualizationHelper";
import VisualizationMixin from "./VisualizationMixin.vue";
import Treeview from "./Treeview.vue";
import Tree from "./../../business/ontology/taxonomic/Tree";
import TreeNode from "./../../business/ontology/taxonomic/TreeNode";

@Component({
    components: {
        Treeview
    }
})
export default class TreeviewVisualization extends mixins(VisualizationMixin) {
    $refs: {
        treeview: Treeview
        treeviewWrapper: Element,
        fullscreen: any
    }

    @Prop({ required: true })
    private tree: Tree;
    @Prop({ required: false, default: "Multi peptide" })
    private analysisType: "Multi peptide" | "Single peptide";

    @Prop({ default: false })
    private fullScreen: boolean;
    @Prop({ required: false, default: false })
    private autoResize: boolean;
    @Prop({ required: false, default: 600 })
    private height: number;
    @Prop({ required: false, default: null })
    private tooltip: (d: any) => string;

    private width: number = 0;

    private colors: (d: any) => string = (d: any) => {
        if (d.name === "Bacteria") return "#1565C0"; // blue
        if (d.name === "Archaea") return "#FF8F00"; // orange
        if (d.name === "Eukaryota") return "#2E7D32"; // green
        if (d.name === "Viruses") return "#C62828"; // red
        // @ts-ignore
        return d3Scale.scaleOrdinal(d3.schemeCategory10).call(this, d);
    };

    private rerootCallback: (d: any) => void  = (d: any) => this.search(d.id, d.name, 1000);
    private data: TreeNode = null;
    private tooltipFunction: (d: any) => string = null;

    mounted() {
        this.tooltipFunction = this.tooltip || tooltipContent;
        this.initTreeview();
    }

    @Watch("tree")
    private onTreeChanged() {
        this.initTreeview();
    }

    @Watch("fullScreen")
    private onFullScreenChanged(newFullScreen: boolean,) {
        this.$refs.treeview.setFullScreen(newFullScreen)
    }

    reset() {
        this.$refs.treeview.reset();
    }

    private async initTreeview() {
        this.width = this.$refs.treeviewWrapper.clientWidth;
        if (this.tree) {
            this.data = this.tree.getRoot();
        }
    }

    private enableFullscreen() {
        this.$refs.fullscreen.toggle();
    }
}
</script>

<style lang="less">
    @import './../../assets/style/visualizations.css.less';

    #treeviewWrapper {
        background: white;
    }

    #treeviewWrapper svg {
        width: 100%;
        max-height: 600px;
    }

    .fullscreen #treeviewWrapper svg {
        max-height: 100%;
    }
</style>
