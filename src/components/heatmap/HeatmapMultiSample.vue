<template>
    <div v-if="selectedItems.length === 0">
        Please select at least one item for both axis of the heatmap.
    </div>
    <div v-else style="width: 100%;">
        <div
            v-if="heatmapLoading"
            style="display: flex; justify-content: center;">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <heatmap-visualization
            v-else
            :data="heatmapData"
            :row-labels="heatmapRows"
            :column-labels="heatmapColumns">
        </heatmap-visualization>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import MultiAssayDataSourceItem from "./MultiAssayDataSourceItem";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";
import Normalizer from "./../../business/normalisation/Normalizer";
import { Prop, Watch } from "vue-property-decorator";
import sha256 from "crypto-js/sha256";
import HeatmapVisualization from "./HeatmapVisualization.vue";

@Component({
    components: {
        HeatmapVisualization
    }
})
export default class HeatmapMultiSample extends Vue {
    @Prop({ required: true })
    private normalizer: Normalizer;
    @Prop({ required: true })
    private selectedItems: MultiAssayDataSourceItem[];
    @Prop({ required: true })
    private assays: ProteomicsAssay[];

    private heatmapData: number[][] = [];
    private heatmapRows: string[] = [];
    private heatmapColumns: string[] = [];
    // Keeps track of a hash of the previously computed data for the heatmap
    private previouslyComputed: string = "";
    private heatmapLoading: boolean = false;

    private mounted() {
        this.computeHeatmapAndProceed();
    }

    @Watch("normalizer")
    @Watch("assays")
    @Watch("selectedItems")
    private async computeHeatmapAndProceed() {
        let newHash = sha256(this.normalizer.toString() + this.selectedItems.toString()).toString();

        if (newHash === this.previouslyComputed) {
            return;
        }

        this.heatmapLoading = true;
        this.previouslyComputed = newHash;

        let rows: string[] = [];
        let cols: string[] = [];

        let grid: number[][] = [];

        for (let i = 0; i < this.selectedItems.length; i++) {
            let item: MultiAssayDataSourceItem = this.selectedItems[i];
            rows.push(item.name);
        }

        for (let i = 0; i < this.assays.length; i++) {
            let item: ProteomicsAssay = this.assays[i];
            cols.push(item.getName());
        }

        for (let item of this.selectedItems) {
            let gridRow: number[] = [];
            for (let assay of this.assays) {
                const values: number = item.countPerAssayId.get(assay.id);
                gridRow.push(values ? values : 0);
            }
            grid.push(gridRow);
        }

        this.heatmapRows.splice(0, this.heatmapRows.length);
        this.heatmapRows.push(...rows);
        this.heatmapColumns.splice(0, this.heatmapColumns.length);
        this.heatmapColumns.push(...cols);
        this.heatmapData.splice(0, this.heatmapData.length);
        this.heatmapData.push(...this.normalizer.normalize(grid));
        this.heatmapLoading = false;
    }
}
</script>

<style scoped>

</style>
