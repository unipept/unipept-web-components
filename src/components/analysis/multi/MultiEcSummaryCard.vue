<template>
    <ec-summary-card
        :assay="assay"
        :show-percentage="showPercentage">
        <template v-slot:analysis-header>
            <filter-functional-annotations-dropdown v-model="percentSettings">
            </filter-functional-annotations-dropdown>
            <span>This panel shows the Enzyme Commission numbers that were matched to your peptides. </span>
            <span v-html="trustLine"></span>
            <span>Click on a row in the table to see a taxonomy tree that highlights occurrences.</span>
        </template>
    </ec-summary-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import EcSummaryCard from "./../functional/EcSummaryCard.vue";
import FilterFunctionalAnnotationsDropdown from "./../functional/FilterFunctionalAnnotationsDropdown.vue";
import { Prop, Watch } from "vue-property-decorator";
import EcCountTableProcessor from "./../../../business/processors/functional/ec/EcCountTableProcessor";
import { FunctionalUtils } from "./../functional/FunctionalUtils";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import ProteomicsAssay from "./../../../business/entities/assay/ProteomicsAssay";

@Component({
    components: { EcSummaryCard, FilterFunctionalAnnotationsDropdown }
})
export default class MultiEcSummaryCard extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: false, default: false })
    private showPercentage: boolean;

    private trust: FunctionalTrust = null;
    private trustLine: string = "";
    private percentSettings: string = "5";

    private loading: boolean = false;

    private mounted() {
        this.recompute();
    }

    get ecCountTableProcessor(): EcCountTableProcessor {
        return this.$store.getters["ec/filteredData"](this.assay)?.processor;
    }

    @Watch("ecCountTableProcessor")
    private async recompute() {
        this.loading = true;
        if (this.ecCountTableProcessor) {
            this.trust = await this.ecCountTableProcessor.getTrust();
            this.trustLine = FunctionalUtils.computeTrustLine(
                this.trust,
                "EC number",
                "peptide"
            );

        }
        this.loading = false;
    }
}
</script>

<style scoped>

</style>
