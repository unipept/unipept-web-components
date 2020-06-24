<docs>
    A variant of the GoSummaryCard specifically designed for the analysis of multiple peptides. This variant works
    with a PeptideCountTable as input and provides the counted GO-terms in function of the amount of peptides associated
    with it.
</docs>

<template>
    <go-summary-card>
        <template v-slot:analysis-header>
            <filter-functional-annotations-dropdown v-model="percentSettings">
            </filter-functional-annotations-dropdown>
            <span>This panel shows the Gene Ontology annotations that were matched to your peptides. </span>
            <span v-html="trustLine"></span>
            <span>Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
        </template>
        <template v-slot:content-biological-process>
            <go-summary
                :assay="assay"
                :namespace="namespaces[0]"
                :show-percentage="showPercentage">
            </go-summary>
        </template>
        <template v-slot:content-cellular-component>
            <go-summary
                :assay="assay"
                :namespace="namespaces[1]"
                :show-percentage="showPercentage">
            </go-summary>
        </template>
        <template v-slot:content-molecular-function>
            <go-summary
                :assay="assay"
                :namespace="namespaces[2]"
                :show-percentage="showPercentage">
            </go-summary>
        </template>
    </go-summary-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import FilterFunctionalAnnotationsDropdown from "./../functional/FilterFunctionalAnnotationsDropdown.vue";
import GoSummaryCard from "./../functional/GoSummaryCard.vue";
import { Prop, Watch } from "vue-property-decorator";
import { CountTable } from "./../../../business/counts/CountTable";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { NcbiId } from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../../business/ontology/taxonomic/Tree";
import GoSummary from "./../functional/GoSummary.vue";
import GoCountTableProcessor from "./../../../business/processors/functional/go/GoCountTableProcessor";
import { GoNamespace } from "./../../../business/ontology/functional/go/GoNamespace";
import GoDefinition, { GoCode } from "./../../../business/ontology/functional/go/GoDefinition";
import StringUtils from "./../../../business/misc/StringUtils";
import { FunctionalUtils } from "./../functional/FunctionalUtils";
import ProteomicsAssay from "./../../../business/entities/assay/ProteomicsAssay";

@Component({
    components: {
        GoSummary,
        FilterFunctionalAnnotationsDropdown,
        GoSummaryCard
    }
})
export default class MultiGoSummaryCard extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: false, default: false })
    private showPercentage: boolean;
    @Prop({ required: false })
    protected taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;

    private trustLine: string = "";
    private percentSettings: string = "5";

    private namespaces: GoNamespace[] = Object.values(GoNamespace).sort();

}
</script>

<style scoped>

</style>
