<template>
    <div>
        <h2 class="ghead">
            <span class="dir">
                <v-btn x-small fab @click="reset()"><v-icon>mdi-restore</v-icon></v-btn>
            </span>
            <span class="dir">
                <v-menu>
                    <template v-slot:activator="{ on }">
                        <v-btn fab x-small v-on="on">
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
                <!-- <div class="btn-group" id="colorswap">
                    <a class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" id="colorswap-button"><span class="glyphicon glyphicon-cog"></span></a>
                    <ul class="dropdown-menu dropdown-menu-right dropdown-menu-form">
                        <li title="Enabling this will assign fixed colors to taxa making it easier to compare samples.">
                            <div class="checkbox">
                                <label class="checkbox">
                                    <input type="checkbox" id="colorswap-checkbox" v-model="isFixedColors">Use fixed colors
                                </label>
                            </div>
                        </li>
                    </ul>
                </div> -->
            </span>
            <span class="dir text">Click a slice to zoom in and the center node to zoom out</span>
        </h2>
        <div v-once ref="visualization"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, {mixins} from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Tree from "../../logic/data-management/Tree";
    import PeptideContainer from "../../logic/data-management/PeptideContainer";
    import {tooltipContent} from "./VisualizationHelper";
    import VisualizationMixin from "./VisualizationMixin.vue";
    import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
    import Sample from '../../logic/data-management/Sample';

    @Component
    export default class SunburstVisualization extends mixins(VisualizationMixin) {
        // Make field non-reactive by not setting it here, but only after created has been called for the first time.
        sunburst!: any;

        @Prop({default: false}) 
        private fullScreen: false;
        @Prop({required: true})
        private sample: Sample;
        @Prop({required: false, default: 740})
        private width: number;
        @Prop({required: false, default: 740})
        private height: number;
        @Prop({required: false, default: 740 / 2})
        private radius: number;

        private isFixedColors: boolean = false;

        mounted() {
            this.initTree();
        }

        @Watch('sample') onSampleChanged() {
            this.initTree();
        }

        @Watch('watchableTaxonId') onWatchableTaxonIdChanged() {
            if (this.watchableTaxonId === -1) {
                this.reset();
            }
        }

        @Watch('fullScreen') onFullScreenChanged(newFullScreen: boolean, oldFullScreen: boolean) {
            this.sunburst.setFullScreen(newFullScreen)
        }

        @Watch('isFixedColors') onIsFixedColorsChanged(newFixedColors: boolean, oldFixedColors: boolean) {
            this.sunburst.settings.useFixedColors = newFixedColors;
            this.sunburst.redrawColors();
        }

        reset() {
            if (this.sunburst) {
                this.sunburst.reset();
            }
        }

        private async initTree() {
            if (this.sample != null) {
                let taxaDataSource: TaxaDataSource = await this.sample.dataRepository.createTaxaDataSource();
                let tree: Tree = await taxaDataSource.getTree();
                const data = JSON.stringify(tree.getRoot());

                // @ts-ignore
                this.sunburst = $(this.$refs.visualization).sunburst(JSON.parse(data), {
                    width: this.width,
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

<style scoped>
    span.dir.text {
        margin-top: 10px;
    }

    span.dir {
        font-size: 12px;
        font-weight: normal;
        color: #555;
        line-height: 100%;
        float: right;
        margin-left: 5px;
    }

    .ghead {
        margin-bottom: 8px;
        margin-top: 5px;
        margin-right: 16px;
        font-weight: bold;
        padding: 0;
        border: 0;
        font-size: 13px;
        line-height: 1.4;
        color: #333;
        height: 30px;
    }
</style>
