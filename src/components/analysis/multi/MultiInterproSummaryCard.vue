<template>
    <interpro-summary-card
        :interpro-count-table="getCountTable"
        :interpro-ontology="getOntology"
        :communication-source="communicationSource"
        :interpro-peptide-mapping="peptideMapping"
        :analysis-in-progress="peptideCountTable"
        :search-configuration="searchConfiguration"
        :loading="loading"
        :relative-counts="relativeCounts"
        :show-percentage="showPercentage"
        :taxa-to-peptides-mapping="taxaToPeptidesMapping"
        :tree="tree">
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
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { CountTable } from "./../../../business/counts/CountTable";
import InterproDefinition, { InterproCode } from "./../../../business/ontology/functional/interpro/InterproDefinition";
import { Ontology } from "./../../../business/ontology/Ontology";
import InterproCountTableProcessor from "./../../../business/processors/functional/interpro/InterproCountTableProcessor";
import {
    convertStringToInterproNamespace,
    InterproNamespace
} from "./../../../business/ontology/functional/interpro/InterproNamespace";
import InterproOntologyProcessor from "./../../../business/ontology/functional/interpro/InterproOntologyProcessor";
import SearchConfiguration from "./../../../business/configuration/SearchConfiguration";
import { NcbiId } from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../../business/ontology/taxonomic/Tree";
import { FunctionalUtils } from "./../../../components/analysis/functional/FunctionalUtils";
import CommunicationSource from "./../../../business/communication/source/CommunicationSource";

@Component({
    components: { InterproSummaryCard, FilterFunctionalAnnotationsDropdown }
})
export default class MultiInterproSummaryCard extends Vue {
    @Prop({ required: true })
    private peptideCountTable: CountTable<Peptide>;
    @Prop({ required: true })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: true })
    private relativeCounts: number;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;
    @Prop({ required: false, default: false })
    private showPercentage: boolean;
    @Prop({ required: false })
    protected taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;
    @Prop({ required: false })
    protected tree: Tree;

    private trustLine: string = "";
    private loading: boolean = false;

    private percentSettings: string = "5";

    private namespaceValues: string[] = ["all"].concat(Object.values(InterproNamespace));

    private items: {
        countTable: CountTable<InterproCode>,
        title: string,
        namespace: string
        ontology: Ontology<InterproCode, InterproDefinition>
    }[] = [];
    private peptideMapping: Map<InterproCode, Peptide[]> = null;

    private created() {
        for (const ns of this.namespaceValues) {
            this.items.push({
                countTable: undefined,
                title: "",
                namespace: ns,
                ontology: undefined
            });
        }
    }

    private mounted() {
        this.recompute();
    }

    @Watch("peptideCountTable")
    @Watch("searchConfiguration")
    public async recompute(): Promise<void> {
        if (this.peptideCountTable && this.searchConfiguration) {
            this.loading = true;
            const percentage = parseInt(this.percentSettings);
            const interproProcessor = new InterproCountTableProcessor(
                this.peptideCountTable,
                this.searchConfiguration,
                this.communicationSource,
                percentage
            );

            this.peptideMapping = await interproProcessor.getAnnotationPeptideMapping();


            for (const [i, ns] of this.namespaceValues.entries()) {
                let countTable: CountTable<InterproCode>;

                if (ns === "all") {
                    countTable = await interproProcessor.getCountTable();
                } else {
                    countTable = await interproProcessor.getCountTable(ns as InterproNamespace);
                }

                this.items[i].countTable = countTable;

                const ontologyProcessor = new InterproOntologyProcessor(this.communicationSource);
                this.items[i].ontology = await ontologyProcessor.getOntology(this.items[i].countTable);
            }

            this.trustLine = FunctionalUtils.computeTrustLine(
                await interproProcessor.getTrust(),
                "InterPro-entry",
                "peptide"
            );
            this.loading = false;
        }
    }

    private getCountTable(ns: string): CountTable<InterproCode> {
        const item = this.items.find(item => item.namespace == ns);
        return item ? item.countTable : undefined;
    }

    private getOntology(ns: string): Ontology<InterproCode, InterproDefinition> {
        const item = this.items.find(item => item.namespace == ns);
        return item ? item.ontology : undefined;
    }
}
</script>

<style scoped>

</style>
