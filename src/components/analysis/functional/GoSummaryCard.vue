<template>
    <v-card flat>
        <v-card-text>
            <div v-if="!this.peptideCountTable" class="mpa-unavailable go">
                <div v-if="isLoading">
                    <h2>Biological Process</h2>
                    <span class="go-waiting">
                        <v-progress-circular :size="50" :width="5" color="primary" indeterminate></v-progress-circular>
                    </span>
                    <h2>Cellular Component</h2>
                    <span class="go-waiting">
                        <v-progress-circular :size="50" :width="5" color="primary" indeterminate></v-progress-circular>
                    </span>
                    <h2>Molecular Function</h2>
                    <span class="go-waiting">
                        <v-progress-circular :size="50" :width="5" color="primary" indeterminate></v-progress-circular>
                    </span>
                </div>
                <div v-else class="placeholder-text">
                    Please select at least one dataset for analysis.
                </div>
            </div>
            <div v-else>
                <filter-functional-annotations-dropdown v-model="percentSettings">
                </filter-functional-annotations-dropdown>
                <span>This panel shows the Gene Ontology annotations that were matched to your peptides. </span>
                <span v-html="trustLine"></span>
                <span>Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
                <div v-for="(namespace, idx) of namespaces" v-bind:key="namespace" style="margin-top: 16px;" class="go-table-container">
                    <h2>{{ items[idx].title }}</h2>
                    <v-row>
                        <v-col :cols="9">
                            <go-amount-table
                                :loading="isLoading"
                                :namespace="namespace"
                                :go-count-table="items[idx].countTable"
                                :go-peptide-mapping="items[idx].peptideMapping"
                                :go-ontology="items[idx].ontology"
                                :relative-counts="relativeCounts"
                                :search-configuration="searchConfiguration"
                                :show-percentage="showPercentage">
                            </go-amount-table>
                        </v-col>
                        <v-col :cols="3">
                            <quick-go-card :items="items[idx].definitions">
                            </quick-go-card>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import FunctionalSummaryMixin from "./FunctionalSummaryMixin.vue";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";
import GoAmountTable from "../../tables/GoAmountTable.vue";
import QuickGoCard from "./QuickGOCard.vue";
import { CountTable } from "./../../../business/counts/CountTable";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import SearchConfiguration from "./../../../business/configuration/SearchConfiguration";
import GoCountTableProcessor from "./../../../business/processors/functional/go/GoCountTableProcessor";
import GoDefinition, { GoCode } from "./../../../business/ontology/functional/go/GoDefinition";
import { GoNamespace } from "./../../../business/ontology/functional/go/GoNamespace";
import StringUtils from "./../../../business/misc/StringUtils";
import { Ontology } from "./../../../business/ontology/Ontology";
import GoOntologyProcessor from "./../../../business/ontology/functional/go/GoOntologyProcessor";

@Component({
    components: {
        FilterFunctionalAnnotationsDropdown,
        GoAmountTable,
        QuickGoCard
    },
    computed: {
        isLoading: {
            get(): boolean {
                return this.calculationsInProgress || this.loading;
            }
        }
    }
})
export default class GoSummaryCard extends mixins(FunctionalSummaryMixin) {
    @Prop({ required: true })
    private peptideCountTable: CountTable<Peptide>;
    @Prop({ required: true })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: true })
    private loading: boolean;
    @Prop({ required: true })
    private relativeCounts: number;
    @Prop({ required: false, default: false })
    private showPercentage: boolean;

    private namespaces: GoNamespace[] = Object.values(GoNamespace).sort();
    private items: {
        countTable: CountTable<GoCode>,
        peptideMapping: Map<GoCode, Peptide[]>,
        definitions: GoDefinition[],
        title: string,
        ontology: Ontology<GoCode, GoDefinition>
    }[] = [];

    private trustLine: string = "";
    private calculationsInProgress: boolean = false;

    mounted() {
        for (let ns of this.namespaces) {
            this.items.push({
                countTable: undefined,
                peptideMapping: undefined,
                definitions: [],
                title: StringUtils.stringTitleize(ns.toString()),
                ontology: undefined
            });
        }

        this.recompute();
    }

    @Watch("peptideCountTable")
    @Watch("searchConfiguration")
    public async recompute() {
        this.calculationsInProgress = true;
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

                this.items[i].definitions.length = 0;
                this.items[i].definitions.push(
                    ...this.items[i].countTable.getOntologyIds().map(id => this.items[i].ontology.getDefinition(id))
                );
            }

            this.trustLine = this.computeTrustLine(await goCountTableProcessor.getTrust(), "GO-terms");
        }
        this.calculationsInProgress = false;
    }
}
</script>

<style>
    .go-waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
    }

    .go-table-container .row {
        flex-wrap: nowrap;
    }
</style>
