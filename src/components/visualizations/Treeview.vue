<template>
    <div v-if="active">
        <div v-if="loading" class="d-flex justify-center mb-5">
            <v-progress-circular :width="5" :size="50" color="primary" indeterminate></v-progress-circular>
        </div>
        <div class="treeview-container" v-once ref="visualization"></div>
    </div>
    <v-container fluid v-else class="error-container mt-2">
        <div class="network-error">
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
import TreeViewNode from "./TreeViewNode";

@Component
export default class Treeview extends Vue {
    @Prop({ required: true })
    private data: TreeViewNode;
    @Prop({ required: false, default: false })
    private autoResize;
    @Prop({ required: false, default: 100 })
    private width: number;
    @Prop({ required: false, default: 50 })
    private height: number;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop()
    private tooltip: (d: any) => string;
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

    private getAmountOfNodes(tree: TreeViewNode): number {
        return tree.children.reduce((acc, child) => acc + this.getAmountOfNodes(child), 0) + tree.children.length;
    }

    @Watch("loading")
    @Watch("width")
    @Watch("height")
    @Watch("tooltip")
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
                height: this.height,
                enableAutoExpand: this.enableAutoExpand,
            }

            // Only these settings that are explicitly filled in should to be passed as an option
            for (let [settingsName, funcName] of this.settingNames) {
                if (this[funcName]) {
                    settings[settingsName] = this[funcName];
                }
            }

            // @ts-ignore
            this.treeview = $(this.$refs.visualization).html("").treeview(JSON.parse(JSON.stringify(this.data)), settings);

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
   .treeview-container svg {
        width: 100% !important;
        max-height: 600px !important;
    }
</style>
