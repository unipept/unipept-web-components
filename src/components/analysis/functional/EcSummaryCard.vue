<template>
    <v-card flat>
        <v-card-text>
            <div v-if="!dataRepository">
                <span class="ec-waiting" v-if="analysisInProgress">
                    <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                </span>
                <span v-else class="placeholder-text">
                    Please select at least one dataset for analysis.
                </span>
            </div>
            <div v-else>
                <filter-functional-annotations-dropdown v-model="percentSettings">
                </filter-functional-annotations-dropdown>
                <span>This panel shows the Enzyme Commission numbers that were matched to your peptides. </span>
                <span v-html="trustLine"></span>
                <span>Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
                <ec-amount-table
                    :loading="calculationsInProgress"
                    :dataRepository="dataRepository"
                    :items="items"
                    :searchSettings="sortSettings">
                </ec-amount-table>
                <v-card outlined v-if="ecTree">
                    <v-btn
                        small
                        depressed
                        class="item-treeview-dl-btn"
                        @click="$refs.imageDownloadModal.downloadSVG('unipept_treeview', '#ec-treeview svg')">
                        <v-icon>mdi-download</v-icon>
                        Save as image
                    </v-btn>
                    <treeview
                        id="ec-treeview"
                        :data="ecTree"
                        :autoResize="true"
                        :height="300"
                        :width="800"
                        :tooltip="ecTreeTooltip"
                        :enableAutoExpand="true">
                    </treeview>
                </v-card>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import FunctionalSummaryMixin from "./FunctionalSummaryMixin.vue";
import Component, { mixins } from "vue-class-component";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";
import EcAmountTable from "../../tables/EcAmountTable.vue";
import TreeViewNode from "../../visualizations/TreeViewNode";
import Treeview from "../../visualizations/Treeview.vue";

@Component({
    components: {
        FilterFunctionalAnnotationsDropdown,
        EcAmountTable,
        Treeview
    }
})
export default class EcSummaryCard extends mixins(FunctionalSummaryMixin) {
    private trustLine: string = "";
    private calculationsInProgress: boolean = false;
    private items: ECAnnotation[] = [];
    private ecTree: TreeViewNode = null;

    mounted() {
        this.recompute();
    }

    private ecTreeTooltip: (d: any) => string = (d: any) => {
        const fullCode = (d.name + ".-.-.-.-").split(".").splice(0, 4).join(".");
        let tip = "";
        tip += `<div class="tooltip-fa-text">
                    <strong>${d.data.count} peptides</strong> have at least one EC number within ${fullCode},<br>`;

        if (d.data.self_count == 0) {
            tip += "no specific annotations";
        } else {
            if (d.data.self_count == d.data.count) {
                tip += " <strong>all specifically</strong> for this number";
            } else {
                tip += ` <strong>${d.data.self_count} specificly</strong> for this number`;
            }
        }

        tip += "</div>";
        return tip;
    };

    public async recompute() {
        this.calculationsInProgress = true;
        if (this.dataRepository) {
            const ecSource: EcDataSource = await this.dataRepository.createEcDataSource();
            const percent = parseInt(this.percentSettings);
            const sequences: string[] = await this.getSequences();

            this.items = await ecSource.getEcNumbers(null, percent, sequences);
            this.trustLine = this.computeTrustLine(await ecSource.getTrust(null, percent, sequences), "EC number");
            this.ecTree = await ecSource.getEcTree(null, percent, sequences);
        }
        this.calculationsInProgress = false;
    }
}
</script>

<style>
    .ec-waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
    }
</style>
