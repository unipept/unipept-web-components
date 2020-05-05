<docs>
    A variant of the GoSummaryCard specifically designed for the analysis of multiple peptides. This variant works
    with a PeptideCountTable as input and provides the counted GO-terms in function of the amount of peptides associated
    with it.
</docs>

<template>
    <go-summary-card :loading="!peptideCountTable">
        <template v-slot:analysis-header>
            <filter-functional-annotations-dropdown v-model="percentSettings">
            </filter-functional-annotations-dropdown>
            <span>This panel shows the Gene Ontology annotations that were matched to your peptides. </span>
            <span v-html="trustLine"></span>
            <span>Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
        </template>
        <template v-slot:content-biological-process>
            <go-summary
                :go-count-table="items[0].countTable"
                :namespace="namespaces[0]"
                :go-peptide-mapping="items[0].peptideMapping"
                :go-ontology="items[0].ontology"
                :relative-counts="relativeCounts"
                :search-configuration="searchConfiguration"
                :show-percentage="showPercentage"
                :taxa-to-peptides-mapping="taxaToPeptidesMapping"
                :loading="calculationsInProgress"
                :tree="tree">
            </go-summary>
        </template>
        <template v-slot:content-cellular-component>
            <go-summary
                :go-count-table="items[1].countTable"
                :namespace="namespaces[1]"
                :go-peptide-mapping="items[1].peptideMapping"
                :go-ontology="items[1].ontology"
                :relative-counts="relativeCounts"
                :search-configuration="searchConfiguration"
                :show-percentage="showPercentage"
                :taxa-to-peptides-mapping="taxaToPeptidesMapping"
                :loading="calculationsInProgress"
                :tree="tree">
            </go-summary>
        </template>
        <template v-slot:content-molecular-function>
            <go-summary
                :go-count-table="items[2].countTable"
                :namespace="namespaces[2]"
                :go-peptide-mapping="items[2].peptideMapping"
                :go-ontology="items[2].ontology"
                :relative-counts="relativeCounts"
                :search-configuration="searchConfiguration"
                :show-percentage="showPercentage"
                :taxa-to-peptides-mapping="taxaToPeptidesMapping"
                :loading="calculationsInProgress"
                :tree="tree">
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
import SearchConfiguration from "./../../../business/configuration/SearchConfiguration";
import { NcbiId } from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../../business/ontology/taxonomic/Tree";
import GoSummary from "./../functional/GoSummary.vue";
import GoCountTableProcessor from "./../../../business/processors/functional/go/GoCountTableProcessor";
import { GoNamespace } from "./../../../business/ontology/functional/go/GoNamespace";
import GoOntologyProcessor from "./../../../business/ontology/functional/go/GoOntologyProcessor";
import GoDefinition, { GoCode } from "./../../../business/ontology/functional/go/GoDefinition";
import { Ontology } from "./../../../business/ontology/Ontology";
import StringUtils from "./../../../business/misc/StringUtils";
import { FunctionalUtils } from "./../functional/FunctionalUtils";

@Component({
    components: {
        GoSummary,
        FilterFunctionalAnnotationsDropdown,
        GoSummaryCard
    }
})
export default class MultiGoSummaryCard extends Vue {
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

    private trustLine: string = "";
    private calculationsInProgress: boolean = false;
    private percentSettings: string = "5";

    private namespaces: GoNamespace[] = Object.values(GoNamespace).sort();
    private items: {
        countTable: CountTable<GoCode>,
        peptideMapping: Map<GoCode, Peptide[]>,
        title: string,
        ontology: Ontology<GoCode, GoDefinition>
    }[] = [];

    created() {
        for (let ns of this.namespaces) {
            this.items.push({
                countTable: null,
                peptideMapping: null,
                title: StringUtils.stringTitleize(ns.toString()),
                ontology: null
            });
        }
        this.recompute();
    }

    @Watch("peptideCountTable")
    @Watch("searchConfiguration")
    @Watch("percentSettings")
    public async recompute() {
        this.calculationsInProgress = true;
        for (let item of this.items) {
            item.countTable = null;
            item.peptideMapping = null;
            item.ontology = null;
        }

        if (this.peptideCountTable) {
            const percentage = parseInt(this.percentSettings);
            const goCountTableProcessor = new GoCountTableProcessor(
                this.peptideCountTable,
                this.searchConfiguration,
                percentage
            );

            for (let i = 0; i < this.namespaces.length; i++) {
                const namespace: GoNamespace = this.namespaces[i];
                this.items[i].countTable = await goCountTableProcessor.getCountTable(namespace);
                this.items[i].peptideMapping = await goCountTableProcessor.getAnnotationPeptideMapping();

                const ontologyProcessor = new GoOntologyProcessor();
                this.items[i].ontology = await ontologyProcessor.getOntology(this.items[i].countTable);
            }

            this.trustLine = FunctionalUtils.computeTrustLine(await goCountTableProcessor.getTrust(), "GO-term", "peptide");
        }
        this.calculationsInProgress = false;
    }
}
</script>

<style scoped>

</style>
