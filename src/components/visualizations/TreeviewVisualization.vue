<template>
    <div ref="treeviewWrapper">
        <h2 class="ghead">
            <span class="dir">
                <a class="btn btn-xs btn-default btn-animate" @click="reset()" title="reset visualisation">
                    <span class="glyphicon glyphicon-repeat spin"></span>
                </a>
            </span>
            <span class="dir text">Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root</span>
        </h2>
        <treeview ref="treeview" :data="data" :width="this.width" :height="600" :enableAutoExpand="true" :tooltip="tooltip" :colors="colors" :rerootCallback="rerootCallback"></treeview>
    </div>
</template>

<script lang="ts">
    import d3 from "d3";
    import Vue from "vue";
    import Component, {mixins} from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Tree from "../../logic/data-management/Tree";
    import {tooltipContent} from "./VisualizationHelper";
    import VisualizationMixin from "./VisualizationMixin.vue";
    import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
    import Treeview from "./Treeview.vue";
    import {Node} from "../../logic/data-management/Node";
    import DataRepository from '../../logic/data-source/DataRepository';

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

        @Prop({default: false}) 
        private fullScreen: boolean;
        @Prop({required: true})
        private dataRepository: DataRepository;
        @Prop({required: false, default: -1})
        private width: number;
        @Prop({required: false, default: 600})
        private height: number;

        private colors: (d: any) => string = (d: any) => {
            if (d.name === "Bacteria") return "#1565C0"; // blue
            if (d.name === "Archaea") return "#FF8F00"; // orange
            if (d.name === "Eukaryota") return "#2E7D32"; // green
            if (d.name === "Viruses") return "#C62828"; // red
            // @ts-ignore
            return d3.scale.category10().call(this, d);
        };

        private rerootCallback: (d: any) => void  = (d: any) => this.search(d.id, d.name, 1000);
        private data: Node = null;
        private tooltip: (d: any) => string = tooltipContent; 

        mounted() {
            this.initTreeview();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initTreeview();
        }

        @Watch('watchableTaxonId') onWatchableTaxonIdChanged() {
            if (this.watchableTaxonId === -1) {
                this.reset();
            }
        }

        @Watch('fullScreen') onFullScreenChanged(newFullScreen: boolean, oldFullScreen: boolean) {
            this.$refs.treeview.setFullScreen(newFullScreen)
        }

        reset() {
            this.$refs.treeview.reset();
        }

        private async initTreeview() {
            this.width = this.width === -1 ? this.$refs.treeviewWrapper.clientWidth : this.width;
            if (this.dataRepository != null) {
                let taxaDataSource: TaxaDataSource = await this.dataRepository.createTaxaDataSource();
                let tree: Tree = await taxaDataSource.getTree();
                this.data = tree.getRoot();
            }
        }
    }
</script>

<style lang="less" scoped>
    @import './../../assets/style/visualizations.css.less';
</style>
