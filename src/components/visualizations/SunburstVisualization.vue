<template>
    <div id="sunburstWrapper" ref="sunburstWrapper" v-if="active">
        <h2 class="ghead">
            <span class="dir">
                <v-btn x-small fab @click="reset()" :elevation="0"><v-icon>mdi-restore</v-icon></v-btn>
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
    <v-container fluid v-else class="error-container mt-2">
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
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { tooltipContent } from "./VisualizationHelper";
import VisualizationMixin from "./VisualizationMixin.vue";
import Tree from "./../../business/ontology/taxonomic/Tree";

@Component
export default class SunburstVisualization extends mixins(VisualizationMixin) {
    // Make field non-reactive by not setting it here, but only after created has been called for the first time.
    sunburst!: any;

    @Prop({ default: false })
    private fullScreen: false;
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
    // If we notice that a very large Tree is passed to this component, it will automatically be disabled and requires
    // the users permission to start loading the visualisation.
    private active: boolean = true;

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

    @Watch("fullScreen")
    private onFullScreenChanged(newFullScreen: boolean, oldFullScreen: boolean) {
        this.sunburst.setFullScreen(newFullScreen)
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

        const data = JSON.stringify(this.tree.getRoot());

        // @ts-ignore
        this.sunburst = $(this.$refs.visualization).sunburst(JSON.parse(data), {
            width: this.width,
            height: this.height,
            radius: this.radius,
            getTooltip: tooltipContent,
            getTitleText: d => `${d.name} (${d.rank})`,
            rerootCallback: d => this.search(d.id, d.name, 500),
            useFixedColors: this.isFixedColors
        });

        if (this.autoResize) {
            let svgEl = (this.$refs.visualization as HTMLElement).querySelector("svg")
            svgEl.setAttribute("height", "100%")
            svgEl.setAttribute("width", "100%")
        }
    }
}
</script>

<style lang="less">
    @import './../../assets/style/visualizations.css.less';

    .full-screen #sunburstWrapper > .unipept-sunburst > svg {
        position: relative;
        left: -245px;
    }

    #sunburstWrapper {
        height: 100%;
    }

    .full-screen #sunburstWrapper {
        height: calc(100% - 48px);
    }

    .unipept-sunburst {
        width: 100% !important;
    }

    .error-container {
        max-width: 600px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
    }

    #sunburstWrapper > .unipept-sunburst > svg {
        max-height: 800px;
    }
</style>
