<template>
    <ec-summary-card
        :ec-count-table="ecCountTable"
        :ec-ontology="ecOntology"
        :ec-peptide-mapping="ecPeptideMapping"
        :taxa-to-peptides-mapping="taxaToPeptidesMapping"
        :show-percentage="showPercentage"
        :search-configuration="searchConfiguration"
        :tree="tree"
        :loading="calculationsInProgress"
        :relative-counts="relativeCounts">
        <template v-slot:analysis-header>
            <filter-functional-annotations-dropdown v-model="percentSettings">
            </filter-functional-annotations-dropdown>
            <span>This panel shows the Enzyme Commission numbers that were matched to your peptides. </span>
            <span v-html="trustLine"></span>
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
import EcOntologyProcessor from "./../../../business/ontology/functional/ec/EcOntologyProcessor";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { CountTable } from "./../../../business/counts/CountTable";
import SearchConfiguration from "./../../../business/configuration/SearchConfiguration";
import EcDefinition, { EcCode } from "./../../../business/ontology/functional/ec/EcDefinition";
import { Ontology } from "./../../../business/ontology/Ontology";
import { FunctionalUtils } from "./../functional/FunctionalUtils";
import { NcbiId } from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../../business/ontology/taxonomic/Tree";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";

@Component({
    components: { EcSummaryCard, FilterFunctionalAnnotationsDropdown }
})
export default class MultiEcSummaryCard extends Vue {
    @Prop({ required: true })
    private peptideCountTable: CountTable<Peptide>;
    @Prop({ required: true })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: true })
    private relativeCounts: number;
    @Prop({ required: false, default: false })
    private showPercentage: boolean;
    @Prop({ required: false })
    protected taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;
    @Prop({ required: false })
    protected tree: Tree;

    private ecCountTable: CountTable<EcCode> = null;
    private ecPeptideMapping: Map<EcCode, Peptide[]> = null;
    private ecOntology: Ontology<EcCode, EcDefinition> = null;

    private trust: FunctionalTrust = null;
    private trustLine: string = "";
    private percentSettings: string = "5";

    private calculationsInProgress: boolean = false;

    private mounted() {
        this.recompute();
    }

    @Watch("peptideCountTable")
    @Watch("searchConfiguration")
    private async recompute() {
        this.calculationsInProgress = true;
        console.log("peptide count table");
        console.log(this.peptideCountTable);
        if (this.peptideCountTable) {
            const percentage = parseInt(this.percentSettings);
            const ecCountTableProcessor = new EcCountTableProcessor(
                this.peptideCountTable,
                this.searchConfiguration,
                percentage
            );
            this.ecCountTable = await ecCountTableProcessor.getCountTable();
            this.ecPeptideMapping = await ecCountTableProcessor.getAnnotationPeptideMapping();

            const ontologyProcessor = new EcOntologyProcessor();
            this.ecOntology = await ontologyProcessor.getOntology(this.ecCountTable);

            this.trust = await ecCountTableProcessor.getTrust();
            this.trustLine = FunctionalUtils.computeTrustLine(
                this.trust,
                "EC number",
                "peptide"
            );

            console.log(this.ecCountTable);
        }
        this.calculationsInProgress = false;
    }
}
</script>

<style scoped>

</style>
