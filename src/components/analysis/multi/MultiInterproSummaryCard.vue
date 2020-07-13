<template>
    <interpro-summary-card
        :assay="assay"
        :show-percentage="showPercentage">
        <template v-slot:analysis-header>
            <filter-functional-annotations-dropdown v-model="percentSettings">
            </filter-functional-annotations-dropdown>
            <span>This panel shows the Interpro entries that were matched to your peptides. </span>
            <span v-html="trustLine"></span>
            <span>Click on a row in the table to see a taxonomy tree that highlights occurrences.</span>
        </template>
    </interpro-summary-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import InterproSummaryCard from "./../functional/InterproSummaryCard.vue";
import FilterFunctionalAnnotationsDropdown from "./../functional/FilterFunctionalAnnotationsDropdown.vue";
import { Prop, Watch } from "vue-property-decorator";
import InterproCountTableProcessor from "./../../../business/processors/functional/interpro/InterproCountTableProcessor";
import {
    convertStringToInterproNamespace,
    InterproNamespace
} from "./../../../business/ontology/functional/interpro/InterproNamespace";
import { FunctionalUtils } from "./../../../components/analysis/functional/FunctionalUtils";
import ProteomicsAssay from "./../../../business/entities/assay/ProteomicsAssay";

@Component({
    components: { InterproSummaryCard, FilterFunctionalAnnotationsDropdown }
})
export default class MultiInterproSummaryCard extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: true })
    private showPercentage: boolean;

    private trustLine: string = "";
    private loading: boolean = false;
    private percentSettings: string = "5";

    private namespaceValues: string[] = ["all"].concat(Object.values(InterproNamespace));

    private mounted() {
        this.recompute();
    }

    get interproCountTableProcessor(): InterproCountTableProcessor {
        return this.$store.getters["interpro/filteredData"](this.assay)?.processor;
    }

    @Watch("interproCountTableProcessor")
    public async recompute(): Promise<void> {
        this.loading = true;
        if (this.interproCountTableProcessor) {
            this.trustLine = FunctionalUtils.computeTrustLine(
                await this.interproCountTableProcessor.getTrust(),
                "InterPro-entry",
                "peptide"
            );
        }
        this.loading = false;
    }
}
</script>

<style scoped>

</style>
