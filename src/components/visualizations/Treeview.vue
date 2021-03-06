<template>
    <div v-if="active">
        <div v-if="loading" class="d-flex justify-center mb-5">
            <v-progress-circular :width="5" :size="50" color="primary" indeterminate></v-progress-circular>
        </div>
        <div class="treeview-container" v-once ref="visualization"></div>
    </div>
    <v-container fluid v-else class="error-container mt-2 d-flex align-center">
        <div class="error-container">
            <v-icon x-large>
                mdi-alert-circle-outline
            </v-icon>
            <p>
                You're trying to visualise a very large sample. This will work in most cases, but it could take
                some time to render. Are you sure you want to <a @click="initVisualization()">continue</a>?
            </p>
        </div>
    </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { DataNode, DataNodeLike, Treeview as UnipeptTreeview, TreeviewSettings } from "unipept-visualizations";

@Component
export default class Treeview extends Vue {
    @Prop({ required: true })
    private data: DataNodeLike;
    @Prop({ required: false, default: false })
    private autoResize;
    @Prop({ required: false, default: 100 })
    private width: number;
    @Prop({ required: false, default: 50 })
    private height: number;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop()
    private tooltip: (d: DataNode) => string;
    @Prop()
    private tooltipText: (d: DataNode) => string;
    @Prop({ default: false })
    private enableAutoExpand: number | boolean;
    @Prop()
    private colors: (d: any) => string;
    @Prop()
    private rerootCallback: (d: any) => void;
    @Prop()
    private linkStrokeColor: (d: any) => string;
    @Prop()
    private nodeStrokeColor: (d: any) => string
    @Prop()
    private nodeFillColor: (d: any) => string;

    private settingNames: [string, string][] = [
        ["getTooltip", "tooltip"],
        ["getTooltipText", "tooltipText"],
        ["colors", "colors"],
        ["rerootCallback", "rerootCallback"],
        ["linkStrokeColor", "linkStrokeColor"],
        ["nodeStrokeColor", "nodeStrokeColor"],
        ["nodeFillColor", "nodeFillColor"]
    ];

    private treeview!: any;

    private active: boolean = true;

    mounted() {
        this.initVisualization();
    }

    beforeDestroy() {
        const els = document.querySelectorAll(".tip");
        for (const el of els) {
            el.parentNode.removeChild(el);
        }
    }

    public setFullScreen(value: boolean): void {
        if (this.treeview) {
            this.treeview.setFullScreen(value);
        }
    }

    public reset(): void {
        if (this.treeview) {
            this.treeview.reset();
        }
    }

    @Watch("data")
    private async onDataChanged() {
        if (this.data) {
            if (this.getAmountOfNodes(this.data) > 600) {
                this.active = false;
            } else {
                await this.initVisualization();
            }
        }
    }

    private getAmountOfNodes(tree: DataNodeLike): number {
        return tree.children.reduce((acc, child) => acc + this.getAmountOfNodes(child), 0) + tree.children.length;
    }

    @Watch("loading")
    @Watch("width")
    @Watch("height")
    @Watch("tooltip")
    @Watch("tooltipText")
    @Watch("enableAutoExpand")
    @Watch("colors")
    @Watch("rerootCallback")
    @Watch("nodeFillColor")
    @Watch("linkStrokeColor")
    @Watch("nodeStrokeColor")
    private async initVisualization() {
        if (this.data && !this.loading) {
            this.active = true;

            await this.$nextTick();

            let settings = {
                width: this.width,
                height: this.height
            }

            // Only these settings that are explicitly filled in should to be passed as an option
            for (let [settingsName, funcName] of this.settingNames) {
                if (this[funcName]) {
                    settings[settingsName] = this[funcName];
                }
            }

            this.treeview = new UnipeptTreeview(
                this.$refs.visualization as HTMLElement,
                this.data,
                settings as TreeviewSettings
            )

            if (this.autoResize) {
                let svgEl = (this.$refs.visualization as HTMLElement).querySelector("svg");
                if (svgEl) {
                    svgEl.setAttribute("height", "100%");
                    svgEl.setAttribute("width", "100%");
                }
            }
        }
    }
}
</script>

<style>
    .error-container {
        max-width: 600px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
    }

   .treeview-container svg {
        width: 100%;
        max-height: 600px;
    }

   .fullscreen .treeview-container svg {
       max-height: 100%;
   }

   .fullscreen .treeview-container {
       height: 100%;
   }
</style>
