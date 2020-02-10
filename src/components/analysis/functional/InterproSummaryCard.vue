<template>
    <v-card flat>
        <v-card-text>
            <div v-if="!this.dataRepository">
                <span class="waiting" v-if="this.analysisInProgress">
                    <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                </span>
                <span v-else class="placeholder-text">
                    Please select at least one dataset for analysis.
                </span>
            </div>
            <div v-else>
                <filter-functional-annotations-dropdown v-model="percentSettings"></filter-functional-annotations-dropdown>
                <span>This panel shows the Interpro entries that were matched to your peptides. </span>
                <span v-html="interproTrustLine"></span>
                <span>Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
                <v-select :items="interproNamespaces" label="Category" v-model="selectedNameSpaceModel"></v-select>
                <interpro-amount-table 
                    :loading="calculationsInProgress" 
                    :dataRepository="dataRepository" 
                    :items="interproItems" 
                    :searchSettings="sortSettings">
                </interpro-amount-table>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import FunctionalSummaryMixin from "./FunctionalSummaryMixin.vue";
import InterproDataSource from "../../../logic/data-source/InterproDataSource";
import { InterproNameSpace, convertStringToInterproNameSpace } from "../../../logic/functional-annotations/InterproNameSpace";
import InterproEntry from "../../../logic/functional-annotations/InterproEntry";
import InterproAmountTable from "./../../tables/InterproAmountTable.vue";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";

@Component({
    components: {
        InterproAmountTable,
        FilterFunctionalAnnotationsDropdown
    },
    computed: {
        selectedNameSpace: {
            get(): InterproNameSpace | null {
                if (this.selectedInterproNameSpaceModel === "all") {
                    return null;
                } else {
                    return convertStringToInterproNameSpace(this.selectedNameSpaceModel);
                }
            }
        }
    }
})
export default class InterproSummaryCard extends mixins(FunctionalSummaryMixin) {
    private interproNamespaces: string[] = ["all"].concat(Object.values(InterproNameSpace));
    private selectedNameSpaceModel: string = "all";
    private interproItems: InterproEntry[] = [];
    private interproTrustLine: string = "";
    private calculationsInProgress: boolean = false;

    mounted() {
        this.recompute();
    }

    @Watch("selectedNameSpaceModel")
    private async onNameSpaceChanged() {
        this.recompute();
    }

    public async recompute(): Promise<void> {
        this.calculationsInProgress = true;
        if (this.dataRepository) {
            const percent: number = parseInt(this.percentSettings);
            const interproSource: InterproDataSource = await this.dataRepository.createInterproDataSource();
            const sequences: string[] = await this.getSequences();

            this.interproItems = await interproSource.getInterproEntries(
                // @ts-ignore
                this.selectedNameSpace, 
                percent, 
                sequences
            );
            this.interproTrustLine = this.computeTrustLine(await interproSource.getTrust(
                // @ts-ignore
                this.selectedNameSpace,
                percent,
                sequences
            ), "Interpro entry");
        }
        this.calculationsInProgress = false;
    }


}
</script>

<style lang="less">
    .waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        position: relative;
        transform: translateX(-50%), translate(-35px);
    }
</style>