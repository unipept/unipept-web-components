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
                    Interpro Entries
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
                        <v-list-item :ripple="false" dense class="menu-header">
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
            <v-alert
                v-if="this.selectedNCBITaxon && this.taxonId !== -1"
                dense
                colored-border
                id="filtered-taxon-information">
                <v-row dense align="center">
                    <v-col class="grow">
                        <b>
                            Filtered results
                        </b>
                        : These results are limited to the {{ this.filteredCountTable.totalCount }} peptides specific to
                        <b>
                            {{ this.selectedNCBITaxon.name }} ({{this.selectedNCBITaxon.rank}})
                        </b>.
                    </v-col>
                    <v-col class="shrink">
                        <v-btn @click="taxonId = -1">Undo</v-btn>
                    </v-col>
                </v-row>
            </v-alert>
            <v-tabs-items v-model="currentTab">
                <v-tab-item>
                    <go-summary-card
                        ref="goSummaryCard"
                        :loading="analysisInProgress"
                        :peptide-count-table="filteredCountTable"
                        :search-configuration="searchConfiguration"
                        :relative-counts="relativeCounts">
                    </go-summary-card>
                </v-tab-item>
                <v-tab-item>
                    <ec-summary-card
                        ref="ecSummaryCard"
                        :loading="analysisInProgress"
                        :peptide-count-table="filteredCountTable"
                        :search-configuration="searchConfiguration"
                        :relative-counts="relativeCounts">
                    </ec-summary-card>
                </v-tab-item>
                <v-tab-item>
<!--                    <interpro-summary-card-->
<!--                        ref="interproSummaryCard"-->
<!--                        :dataRepository="dataRepository"-->
<!--                        :analysisInProgress="analysisInProgress"-->
<!--                        :filterTaxonId="taxonId"-->
<!--                        :sortSettings="faSortSettings">-->
<!--                    </interpro-summary-card>-->
                </v-tab-item>
            </v-tabs-items>
        </v-card>
        <div id="tooltip" class="tip"></div>
        <image-download-modal ref="imageDownloadModal"/>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";

import IndeterminateProgressBar from "../../custom/IndeterminateProgressBar.vue";
import CardHeader from "../../custom/CardHeader.vue";
import QuickGoCard from "./QuickGOCard.vue";

import ImageDownloadModal from "../../utils/ImageDownloadModal.vue";

import GoSummaryCard from "./GoSummaryCard.vue";
import EcSummaryCard from "./EcSummaryCard.vue";
import InterproSummaryCard from "./InterproSummaryCard.vue";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { CountTable } from "./../../../business/counts/CountTable";
import NcbiTaxon, { NcbiId } from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import SearchConfiguration from "./../../../business/configuration/SearchConfiguration";
import NcbiCountTableProcessor from "./../../../business/processors/taxonomic/ncbi/NcbiCountTableProcessor";
import PeptideCountTableProcessor from "./../../../business/processors/raw/PeptideCountTableProcessor";
import NcbiOntologyProcessor from "./../../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";

@Component({
    components: {
        CardHeader,
        IndeterminateProgressBar,
        FilterFunctionalAnnotationsDropdown,
        QuickGoCard,
        ImageDownloadModal,
        GoSummaryCard,
        EcSummaryCard,
        InterproSummaryCard
    }
})
export default class FunctionalSummaryCard extends Vue {
    $refs!: {
        imageDownloadModal: ImageDownloadModal,
        goSummaryCard: GoSummaryCard,
        ecSummaryCard: EcSummaryCard,
        interproSummaryCard: InterproSummaryCard
    }

    @Prop({ required: true })
    private peptideCountTable: CountTable<Peptide>;
    @Prop({ required: true })
    private selectedTaxonId: NcbiId;
    @Prop({ required: true })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: false, default: true })
    private analysisInProgress: boolean;

    private filteredCountTable: CountTable<Peptide> = null;

    private selectedSortTypeName: string = "Peptides";
    private relativeCounts: number = 0;

    private taxonId: number = -1;

    private totalPeptides: number = 0;
    private selectedNCBITaxon: NcbiTaxon = null;

    private currentTab: number = 0;
    private dialogOpen: boolean = false;

    private faCalculationsInProgress: boolean = false;

    mounted() {
        this.onSelectedTaxonIdChanged();
    }

    @Watch("selectedTaxonId")
    private onSelectedTaxonIdChanged() {
        this.taxonId = this.selectedTaxonId;
    }

    @Watch("taxonId")
    @Watch("peptideCountTable")
    @Watch("searchConfiguration")
    private async redoCalculations() {
        this.faCalculationsInProgress = true;
        if (this.taxonId === -1) {
            this.filteredCountTable = this.peptideCountTable;
        } else {
            if (this.peptideCountTable) {
                // Update the count tables so that they only count peptides that are associated with the current taxon
                // filter
                const taxaProcessor = new NcbiCountTableProcessor(this.peptideCountTable, this.searchConfiguration);
                const taxaMapping = await taxaProcessor.getLcaPeptideMapping();
                const peptidesForTaxon = taxaMapping.get(this.taxonId);

                const peptideProcessor = new PeptideCountTableProcessor();

                this.filteredCountTable = await peptideProcessor.getPeptideCountTable(
                    peptidesForTaxon,
                    this.searchConfiguration
                );
                const taxaOntologyProcessor = new NcbiOntologyProcessor();
                this.selectedNCBITaxon = await taxaOntologyProcessor.getDefinition(this.taxonId);
            }
        }
        this.faCalculationsInProgress = false;
    }

    private enableRelativeCounts(): void {
        this.relativeCounts = this.peptideCountTable.totalCount;
        this.selectedSortTypeName = "Peptides %"
    }

    private disableRelativeCounts(): void {
        this.relativeCounts = 0;
        this.selectedSortTypeName = "Peptides";
    }
}
</script>

<style lang="less">
    @import './../../../assets/style/placeholder.css.less';

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
</style>
