<docs>
    This component displays both a GoAmountTable and a QuickGoCard. By providing the `loading` prop, the loading state
    of this component will be triggered.
</docs>

<template>
    <v-row>
        <v-col :cols="9">
            <go-amount-table
                :loading="loading"
                :namespace="namespace"
                :go-count-table="goCountTable"
                :go-peptide-mapping="goPeptideMapping"
                :go-ontology="goOntology"
                :relative-counts="relativeCounts"
                :search-configuration="searchConfiguration"
                :show-percentage="showPercentage"
                :taxa-to-peptides-mapping="taxaToPeptidesMapping"
                :communication-source="communicationSource"
                :tree="tree">
            </go-amount-table>
        </v-col>
        <v-col :cols="3">
            <quick-go-card :items="definitions">
            </quick-go-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import GoAmountTable from "./../../tables/GoAmountTable.vue"
import QuickGoCard from "./QuickGoCard.vue";
import GoDefinition, { GoCode } from "./../../../business/ontology/functional/go/GoDefinition";
import { CountTable } from "./../../../business/counts/CountTable";
import { Ontology } from "./../../../business/ontology/Ontology";
import SearchConfiguration from "./../../../business/configuration/SearchConfiguration";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { NcbiId } from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../../business/ontology/taxonomic/Tree";
import CommunicationSource from "./../../../business/communication/source/CommunicationSource";

@Component({
    components: {
        GoAmountTable,
        QuickGoCard
    }
})
export default class GoSummary extends Vue {
    @Prop({ required: true })
    private namespace: string;
    @Prop({ required: true })
    private goCountTable: CountTable<GoCode>;
    @Prop({ required: true })
    private goOntology: Ontology<GoCode, GoDefinition>;
    @Prop({ required: true })
    private relativeCounts: number;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;
    /**
     * Maps a GO-term onto all peptides that are annotated with the term. If this is not provided, no TreeView or
     * per-row-exports will be provided.
     */
    @Prop({ required: false })
    private goPeptideMapping;
    /**
     * The search settings that need be respected while processing peptide-related data. If this is not provided, no
     * TreeView or per-row-exports will be provided.
     */
    @Prop({ required: false })
    private searchConfiguration: SearchConfiguration;
    /**
     * Do we show the counts in an absolute or relative manner? If this is set to true, the relative counts will be
     * displayed. Otherwise the absolute will be given.
     */
    @Prop({ required: false, default: false })
    private showPercentage: boolean;
    /**
     * Mapping from taxa to the peptides that were annotated with this taxon. If this is not set, no TreeView will be
     * provided.
     */
    @Prop({ required: false })
    private taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;
    /**
     * A tree with the complete lca-lineage in which filtering by the taxa associated with a given GO-term should occur.
     * If this is not set, no TreeView will be provided.
     */
    @Prop({ required: false })
    private tree: Tree;
    @Prop({ required: false, default: false })
    private loading: boolean;

    // A list of all GO-terms that should be displayed in this component.
    private definitions: GoDefinition[] = [];

    private mounted() {
        this.onInputsChanged();
    }

    @Watch("goCountTable")
    @Watch("goOntology")
    private onInputsChanged() {
        this.definitions.splice(0, this.definitions.length);
        if (this.goCountTable && this.goOntology) {
            this.definitions.push(...this.goCountTable.getOntologyIds().map(id => this.goOntology.getDefinition(id)));
        }
    }
}
</script>

<style scoped>

</style>
