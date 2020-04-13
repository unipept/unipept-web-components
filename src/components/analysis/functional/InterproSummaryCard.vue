<template>
    <v-card flat>
        <v-card-text>
            <div v-if="!analysisInProgress">
                <span class="placeholder-text">
                    Please select at least one dataset for analysis.
                </span>
            </div>
            <div v-else-if="loading">
                <span class="waiting">
                    <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                </span>
            </div>
            <div v-else>
                <slot name="analysis-header"></slot>

                <v-select :items="namespaceValues" label="Category" v-model="selectedNamespace"></v-select>
                <interpro-amount-table
                    v-if="countTable"
                    :loading="loading"
                    :interpro-count-table="countTable"
                    :interpro-peptide-mapping="interproPeptideMapping"
                    :interpro-ontology="ontology"
                    :relative-counts="relativeCounts"
                    :search-configuration="searchConfiguration"
                    :tree="tree"
                    :taxa-to-peptides-mapping="taxaToPeptidesMapping"
                    :show-percentage="showPercentage">
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
import InterproAmountTable from "./../../tables/InterproAmountTable.vue";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";
import SearchConfiguration from "./../../../business/configuration/SearchConfiguration";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { CountTable } from "./../../../business/counts/CountTable";
import {
    convertStringToInterproNamespace,
    InterproNamespace
} from "./../../../business/ontology/functional/interpro/InterproNamespace";
import InterproDefinition, { InterproCode } from "./../../../business/ontology/functional/interpro/InterproDefinition";
import { Ontology } from "./../../../business/ontology/Ontology";
import InterproCountTableProcessor from "./../../../business/processors/functional/interpro/InterproCountTableProcessor";
import InterproOntologyProcessor from "./../../../business/ontology/functional/interpro/InterproOntologyProcessor";
import StringUtils from "./../../../business/misc/StringUtils";
import { NcbiId } from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../../business/ontology/taxonomic/Tree";

@Component({
    components: {
        InterproAmountTable,
        FilterFunctionalAnnotationsDropdown
    }
})
export default class InterproSummaryCard extends mixins(FunctionalSummaryMixin) {
    @Prop({ required: true })
    private interproCountTable: (ns: string) => Promise<CountTable<InterproCode>>;
    @Prop({ required: true })
    private interproOntology: (ns: string) => Promise<Ontology<InterproCode, InterproDefinition>>;
    @Prop({ required: false })
    private interproPeptideMapping: Map<InterproCode, Peptide[]>;
    @Prop({ required: true })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: false, default: true })
    private analysisInProgress: boolean;
    @Prop({ required: true })
    private relativeCounts: number;
    @Prop( { required: false, default: false })
    private showPercentage: boolean;
    @Prop({ required: false })
    protected taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;
    @Prop({ required: false })
    protected tree: Tree;

    private namespaceValues: string[] = ["all"].concat(Object.values(InterproNamespace));
    private selectedNamespace: string = "all";

    private countTable: CountTable<InterproCode> = null;
    private ontology: Ontology<InterproCode, InterproDefinition> = null;

    mounted() {
        this.onNamespaceChanged();
    }

    @Watch("selectedNamespace")
    @Watch("loading")
    private async onNamespaceChanged() {
        this.countTable = await this.interproCountTable(this.selectedNamespace);
        this.ontology = await this.interproOntology(this.selectedNamespace);
    }
}
</script>

<style lang="less">
    .waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
    }
</style>
