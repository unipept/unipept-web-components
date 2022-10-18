<template>
    <div>
        <v-card>
            <v-tabs color="white" :dark="true" v-model="currentTab" slider-color="secondary" background-color="primary">
                <v-tab>
                    GO Terms
                </v-tab>
                <v-tab>
                    EC Numbers
                </v-tab>
                <v-tab>
                    InterPro
                </v-tab>
                <v-spacer>
                </v-spacer>
                <v-menu close-on-content-click bottom left ref="sortMenu">
                    <template v-slot:activator="{ on }">
                        <v-btn text class="align-self-center mr-4" v-on="on">
                            <v-icon left>mdi-sort-descending</v-icon>
                            {{ selectedSortTypeName }}
                            <v-icon right>mdi-menu-down</v-icon>
                        </v-btn>
                    </template>

                    <v-list class="grey lighten-3">
                        <v-list-item dense class="menu-header">
                            <v-list-item-title>
                                Sort by number of peptides in related proteins

                                <v-dialog v-model="dialogOpen" max-width="600">
                                    <template v-slot:activator="{ on }">
                                        <v-icon right v-on="on">mdi-help-circle</v-icon>
                                    </template>
                                    <v-card>
                                        <v-card-title>
                                            <v-icon left>mdi-help-circle</v-icon> Sorting functional annotations
                                        </v-card-title>
                                        <v-card-text>
                                            <p>The functional annotations can be sorted on two metrics:</p>
                                            <ul>
                                                <li>
                                                    <strong>Peptides</strong>:
                                                    The absolute number of peptides that are associated with a given
                                                    functional annotation.
                                                </li>
                                                <li>
                                                    <strong>Peptides%</strong>:
                                                    Like peptides, but the reported value is represented as a percentage
                                                    indicating the fraction of the total number of peptides.
                                                </li>
                                            </ul>
                                            <p>
                                                <br>
                                                Your "Filter duplicate peptides" setting is taken into account. If it is
                                                enabled, peptides that occur multiple times in your input list are
                                                counted that many times.
                                            </p>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                color="primary"
                                                text
                                                @click="dialogOpen = false">
                                                I understand
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="enableRelativeCounts">
                            <v-list-item-title>
                                Peptides %
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="disableRelativeCounts">
                            <v-list-item-title>
                                Peptides
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-tabs>

            <v-tabs-items v-model="currentTab">
                <v-tab-item>
                    <multi-go-summary-card
                        v-if="!filterInProgress"
                        ref="goSummaryCard"
                        :assay="assay"
                        :show-percentage="showPercentage">
                    </multi-go-summary-card>
                    <div v-else-if="this.filterInProgress" class="mpa-waiting">
                        <v-card-text class="d-flex justify-center">
                            <v-progress-circular :size="70" :width="7" color="primary" indeterminate>
                            </v-progress-circular>
                        </v-card-text>
                    </div>
                    <div v-else>
                        <v-card-text>
                            <div class="placeholder-text">
                                {{ placeholderText }}
                            </div>
                        </v-card-text>
                    </div>
                </v-tab-item>
                <v-tab-item>
                    <multi-ec-summary-card
                        v-if="!filterInProgress"
                        ref="ecSummaryCard"
                        :assay="assay"
                        :show-percentage="showPercentage">
                    </multi-ec-summary-card>
                    <div v-else-if="this.filterInProgress" class="mpa-waiting">
                        <v-card-text class="d-flex justify-center">
                            <v-progress-circular :size="70" :width="7" color="primary" indeterminate>
                            </v-progress-circular>
                        </v-card-text>
                    </div>
                    <div v-else>
                        <v-card-text>
                            <div class="placeholder-text">
                                {{ placeholderText }}
                            </div>
                        </v-card-text>
                    </div>
                </v-tab-item>
                <v-tab-item>
                    <multi-interpro-summary-card
                        v-if="!filterInProgress"
                        ref="interproSummaryCard"
                        :assay="assay"
                        :show-percentage="showPercentage">
                    </multi-interpro-summary-card>
                    <div v-else-if="this.filterInProgress">
                        <v-card-text class="d-flex justify-center">
                            <v-progress-circular :size="70" :width="7" color="primary" indeterminate>
                            </v-progress-circular>
                        </v-card-text>
                    </div>
                    <div v-else>
                        <v-card-text>
                            <div class="placeholder-text">
                                {{ placeholderText }}
                            </div>
                        </v-card-text>
                    </div>
                </v-tab-item>
            </v-tabs-items>
        </v-card>
        <div id="tooltip" class="tip"></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";

import IndeterminateProgressBar from "../../custom/IndeterminateProgressBar.vue";
import CardHeader from "../../custom/CardHeader.vue";
import QuickGoCard from "./QuickGoCard.vue";

import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { CountTable } from "./../../../business/counts/CountTable";
import NcbiTaxon, { NcbiId } from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import LcaCountTableProcessor from "./../../../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import MultiGoSummaryCard from "./../multi/MultiGoSummaryCard.vue";
import MultiEcSummaryCard from "./../multi/MultiEcSummaryCard.vue";
import MultiInterproSummaryCard from "./../multi/MultiInterproSummaryCard.vue";
import ProteomicsAssay from "./../../../business/entities/assay/ProteomicsAssay";
import { Ontology } from "./../../../business/ontology/Ontology";
import { ProgressReport } from "@/business";

@Component({
    components: {
        MultiEcSummaryCard,
        MultiGoSummaryCard,
        MultiInterproSummaryCard,
        CardHeader,
        IndeterminateProgressBar,
        FilterFunctionalAnnotationsDropdown,
        QuickGoCard,
    }
})
export default class FunctionalSummaryCard extends Vue {
    $refs!: {
        goSummaryCard: MultiGoSummaryCard,
        ecSummaryCard: MultiEcSummaryCard,
        interproSummaryCard: MultiInterproSummaryCard
    }

    @Prop({ required: true })
    private assay: ProteomicsAssay;

    private selectedTaxonId: NcbiId = 1;

    private selectedSortTypeName: string = "Peptides";

    private taxonId: number = 1;

    private currentTab: number = 0;
    private dialogOpen: boolean = false;

    private showPercentage: boolean = false;

    private placeholderText = "Please select at least one assay for analysis.";

    mounted() {
        this.onSelectedTaxonIdChanged();
    }

    @Watch("selectedTaxonId")
    private onSelectedTaxonIdChanged() {
        this.taxonId = this.selectedTaxonId;
    }

    get filteredCountTable(): CountTable<Peptide> {
        return this.$store.getters.assayData(this.assay)?.filteredData?.peptideCountTable;
    }

    get ncbiOntology(): Ontology<NcbiId, NcbiTaxon> {
        return this.$store.getters.assayData(this.assay)?.ncbiOntology;
    }

    get filteredNcbiId(): number {
        return this.$store.getters.assayData(this.assay)?.filterId;
    }

    get filteredNcbiTaxon(): NcbiTaxon {
        return this.ncbiOntology.getDefinition(this.filteredNcbiId);
    }

    get filterProgress(): ProgressReport {
        return this.$store.getters.assayData(this.assay)?.filterProgress;
    }

    get filterInProgress(): boolean {
        return this.filterProgress.currentStep !== this.filterProgress.steps.length;
    }

    private enableRelativeCounts(): void {
        this.showPercentage = true;
        this.selectedSortTypeName = "Peptides %"
    }

    private disableRelativeCounts(): void {
        this.showPercentage = false;
        this.selectedSortTypeName = "Peptides";
    }
}
</script>

<style lang="less">
    /*@import './../../../assets/style/placeholder.css.less';*/

    .menu-header .v-list__tile {
        height: 28px;
    }

    .menu-header .v-list__tile__title {
        font-size: 12px;
        color: #777;
    }

    .menu-header .v-icon {
        font-size: 16px;
    }

    #filtered-taxon-information {
        background-color: #ffe57f;
    }

    .go-table-container .row {
        flex-wrap: nowrap;
    }

    .mpa-waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
    }
</style>
