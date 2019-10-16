<template>
    <div ref="sunburstWrapper">
        <h2 class="ghead">
            <span class="dir">
                <v-btn x-small fab @click="reset()" :elevation="0"><v-icon>mdi-restore</v-icon></v-btn>
            </span>
            <span class="dir">
                <v-menu>
                    <template v-slot:activator="{ on }">
                        <v-btn fab x-small v-on="on" :elevation="0">
                            <v-icon>mdi-settings</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item>
                            <v-list-item-action>
                                <v-checkbox v-model="isFixedColors" color="primary"></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                                <v-list-item-title>Use fixed colors</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </span>
            <span class="dir text">Click a slice to zoom in and the center node to zoom out</span>
        </h2>
        <div v-once ref="visualization"></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import Tree from "../../logic/data-management/Tree";
import { tooltipContent } from "./VisualizationHelper";
import VisualizationMixin from "./VisualizationMixin.vue";
import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
import DataRepository from "../../logic/data-source/DataRepository";

    @Component
export default class SunburstVisualization extends mixins(VisualizationMixin) {
        // Make field non-reactive by not setting it here, but only after created has been called for the first time.
        sunburst!: any;

        @Prop({ default: false }) 
        private fullScreen: false;
        @Prop({ required: true })
        private dataRepository: DataRepository;
        // The width of the parent container is chosen if no specific width is set by the user.
        @Prop({ required: false, default: -1 })
        private width: number;
        @Prop({ required: false, default: 740 })
        private height: number;
        @Prop({ required: false, default: 740 / 2 })
        private radius: number;

        private isFixedColors: boolean = false;

        mounted() {
            this.initTree();
        }

        @Watch("dataRepository") onDataRepositoryChanged() {
            this.initTree();
        }

        @Watch("watchableTaxonId") onWatchableTaxonIdChanged() {
            if (this.watchableTaxonId === -1) {
                this.reset();
            }
        }

        @Watch("fullScreen") onFullScreenChanged(newFullScreen: boolean, oldFullScreen: boolean) {
            this.sunburst.setFullScreen(newFullScreen)
        }

        @Watch("isFixedColors") onIsFixedColorsChanged(newFixedColors: boolean, oldFixedColors: boolean) {
            this.sunburst.settings.useFixedColors = newFixedColors;
            this.sunburst.redrawColors();
        }

        reset() {
            if (this.sunburst) {
                this.sunburst.reset();
            }
        }

        private async initTree() {
            if (this.dataRepository != null) {
                let taxaDataSource: TaxaDataSource = await this.dataRepository.createTaxaDataSource();
                let tree: Tree = await taxaDataSource.getTree();
                const data = JSON.stringify(tree.getRoot());

                // @ts-ignore
                this.sunburst = $(this.$refs.visualization).sunburst(JSON.parse(data), {
                    width: this.width === -1 ? (this.$refs.sunburstWrapper as Element).clientWidth : this.width,
                    height: this.height,
                    radius: this.radius,
                    getTooltip: tooltipContent,
                    getTitleText: d => `${d.name} (${d.rank})`,
                    rerootCallback: d => this.search(d.id, d.name, 1000),
                });
            }
        }
}
</script>

<style lang="less" scoped>
    @import './../../assets/style/visualizations.css.less';
</style>
