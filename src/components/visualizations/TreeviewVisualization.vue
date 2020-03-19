<template>
    <div id="treeviewWrapper" ref="treeviewWrapper" style="height: 100%;">
        <h2 class="ghead">
            <span class="dir">
                <v-btn x-small fab @click="reset()" :elevation="0"><v-icon>mdi-restore</v-icon></v-btn>
            </span>
            <span class="dir text">Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root</span>
        </h2>
        <treeview ref="treeview" :data="data" :autoResize="this.autoResize" :width="this.width" :height="this.height" :enableAutoExpand="true" :tooltip="tooltip" :colors="colors" :rerootCallback="rerootCallback"></treeview>
    </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import * as d3Scale from "d3-scale";
import Vue from "vue";
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
        treeviewWrapper: Element
    }

    @Prop({ default: false })
    private fullScreen: boolean;
    @Prop({ required: true })
    private tree: Tree;
    @Prop({ required: false, default: false })
    private autoResize: number;
    @Prop({ required: false, default: -1 })
    private width: number;
    @Prop({ required: false, default: 600 })
    private height: number;

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
    private tooltip: (d: any) => string = tooltipContent;

    mounted() {
        this.initTreeview();
    }

    @Watch("dataRepository") onDataRepositoryChanged() {
        this.initTreeview();
    }

    @Watch("fullScreen") onFullScreenChanged(newFullScreen: boolean, oldFullScreen: boolean) {
        this.$refs.treeview.setFullScreen(newFullScreen)
    }

    reset() {
        this.$refs.treeview.reset();
    }

    private async initTreeview() {
        this.width = this.width === -1 ? this.$refs.treeviewWrapper.clientWidth : this.width;
        if (this.tree) {
            this.data = this.tree.getRoot();
        }
    }
}
</script>

<style lang="less">
    @import './../../assets/style/visualizations.css.less';

    .treeviewWrapper svg {
        width: 100% !important;
        max-height: 600px !important;
    }
</style>
