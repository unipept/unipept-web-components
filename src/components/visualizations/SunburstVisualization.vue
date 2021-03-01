<template>
    <fullscreen ref="fullscreen">
        <div id="sunburstWrapper" ref="sunburstWrapper">
            <h2 class="ghead">
                <span class="dir">
                    <v-btn x-small fab @click="enableFullscreen()" :elevation="0">
                        <v-icon>mdi-fullscreen</v-icon>
                    </v-btn>
                </span>
                <span class="dir">
                    <v-btn x-small fab @click="reset()" :elevation="0">
                        <v-icon>mdi-restore</v-icon>
                    </v-btn>
                </span>
                <span class="dir">
                    <v-menu>
                        <template v-slot:activator="{ on }">
                            <v-btn fab x-small v-on="on" :elevation="0">
                                <v-icon>mdi-cog-outline</v-icon>
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
    </fullscreen>
</template>

<script lang="ts">
import fullscreen from "vue-fullscreen";
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { tooltipContent } from "./VisualizationHelper";
import VisualizationMixin from "./VisualizationMixin.vue";
import Tree from "./../../business/ontology/taxonomic/Tree";
import { Sunburst } from "unipept-visualizations"

@Component
export default class SunburstVisualization extends mixins(VisualizationMixin) {
    $refs!: {
        sunburstWrapper: any,
        fullscreen: any,
        visualization: any
    }

    // Make field non-reactive by not setting it here, but only after created has been called for the first time.
    sunburst!: any;

    @Prop({ required: true })
    private tree: Tree;
    @Prop({ required: false, default: false })
    private autoResize: boolean;
    @Prop({ required: false, default: 740 })
    private width: number;
    @Prop({ required: false, default: 740 })
    private height: number;
    @Prop({ required: false, default: 740 / 2 })
    private radius: number;

    private isFixedColors: boolean = false;

    mounted() {
        this.initTree();
    }

    beforeDestroy() {
        const els = document.querySelectorAll(".tip");
        for (const el of els) {
            el.parentNode.removeChild(el);
        }
    }

    @Watch("tree")
    private async onTreeChanged() {
        await this.initTree();
    }

    @Watch("isFixedColors")
    private onIsFixedColorsChanged(newFixedColors: boolean, oldFixedColors: boolean) {
        this.sunburst.settings.useFixedColors = newFixedColors;
        this.sunburst.redrawColors();
    }

    public reset() {
        if (this.sunburst) {
            this.sunburst.reset();
        }
    }

    private async initTree() {
        if (this.tree != null) {
            await this.showVisualization();
        }
    }

    private async showVisualization() {
        await this.$nextTick();

        this.sunburst = new Sunburst(
            this.$refs.visualization as HTMLElement,
            this.tree.getRoot(),
            // @ts-ignore
            {
                width: this.width,
                height: this.height,
                radius: this.radius,
                getTooltipText: tooltipContent,
                getTitleText: d => `${d.name} (${d.extra.rank})`,
                rerootCallback: d => this.search(d.id, d.name, 500),
                useFixedColors: this.isFixedColors
            }
        );

        if (this.autoResize) {
            let svgEl = (this.$refs.visualization as HTMLElement).querySelector("svg")
            svgEl.setAttribute("height", "100%")
            svgEl.setAttribute("width", "100%")
        }
    }

    private enableFullscreen() {
        this.$refs.fullscreen.toggle();
    }
}
</script>

<style lang="less">
    @import './../../assets/style/visualizations.css.less';

    .full-screen #sunburstWrapper > .sunburst > svg {
        position: relative;
        left: -245px;
    }

    #sunburstWrapper {
        height: 100%;
    }

    .full-screen #sunburstWrapper {
        height: calc(100% - 48px);
    }

    .sunburst {
        width: 100% !important;
    }

    .error-container {
        max-width: 600px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
    }

    #sunburstWrapper {
        background: white;
    }

    #sunburstWrapper > .sunburst > svg {
        max-height: 800px;
    }

    .fullscreen #sunburstWrapper > .sunburst > svg {
        max-height: calc(100% - 43px);
    }

    .sunburst {
        display: flex;
        flex-direction: row-reverse;
    }
</style>
