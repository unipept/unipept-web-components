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
                <v-menu :close-on-content-click="false" bottom left ref="sortMenu">
                    <template v-slot:activator="{ on }">
                        <v-btn text class="align-self-center mr-4" v-on="on">
                            <v-icon left>mdi-sort-descending</v-icon>
                            {{ faSortSettings.name }}
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
                                                <li><strong>Peptides</strong>: The absolute number of peptides that are associated with a given functional annotation.</li>
                                                <li><strong>Peptides%</strong>: Like peptides, but the reported value is represented as a percentage indicating the fraction of the total number of peptides.</li>
                                            </ul>
                                            <p>
                                                <br>Your "Filter duplicate peptides" setting is taken into account. If it is enabled, peptides that occur multiple times
                                                in your input list are counted that many times.
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
                        <v-list-item @click="setFormatSettings('percent', 'fractionOfPepts', 'fractionOfPepts', 'Peptides %')">
                            <v-list-item-title>
                                Peptides %
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="setFormatSettings('int', 'popularity', 'fractionOfPepts', 'Peptides')">
                            <v-list-item-title>
                                Peptides
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-tabs>
            <v-alert v-if="this.selectedNCBITaxon && this.taxonId != -1" dense colored-border id="filtered-taxon-information">
                <v-row dense align="center">
                    <v-col class="grow">
                        <b>
                            Filtered results
                        </b>
                        : These results are limited to the {{ this.totalPeptides }} peptides specific to
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
                        :dataRepository="dataRepository"
                        :analysisInProgress="analysisInProgress"
                        :filterTaxonId="taxonId"
                        :sortSettings="faSortSettings">
                    </go-summary-card>
                </v-tab-item>
                <v-tab-item>
                    <ec-summary-card
                        ref="ecSummaryCard"
                        :dataRepository="dataRepository"
                        :analysisInProgress="analysisInProgress"
                        :filterTaxonId="taxonId"
                        :sortSettings="faSortSettings">
                    </ec-summary-card>
                </v-tab-item>
                <v-tab-item>
                    <interpro-summary-card
                        ref="interproSummaryCard"
                        :dataRepository="dataRepository"
                        :analysisInProgress="analysisInProgress"
                        :filterTaxonId="taxonId"
                        :sortSettings="faSortSettings">
                    </interpro-summary-card>
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
import FaSortSettings from "../../tables/FaSortSettings";
import { numberToPercent, stringTitleize } from "../../../logic/utils";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";

import IndeterminateProgressBar from "../../custom/IndeterminateProgressBar.vue";
import CardHeader from "../../custom/CardHeader.vue";
import QuickGoCard from "./QuickGOCard.vue";

import ImageDownloadModal from "../../utils/ImageDownloadModal.vue";
import DataRepository from "../../../logic/data-source/DataRepository";
import GOAnnotation from "../../../logic/functional-annotations/GOAnnotation";

import NCBITaxon from "../../../logic/data-management/ontology/taxa/NCBITaxon";
import { Ontologies } from "../../../logic/data-management/ontology/Ontologies";
import GoSummaryCard from "./GoSummaryCard.vue";
import EcSummaryCard from "./EcSummaryCard.vue";
import InterproSummaryCard from "./InterproSummaryCard.vue";

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
    private dataRepository: DataRepository;
    @Prop({ required: false, default: true })
    private analysisInProgress: boolean;
    @Prop({ required: true })
    private selectedTaxonId: number;

    private taxonId: number = -1;

    private totalPeptides: number = 0;
    private selectedNCBITaxon: NCBITaxon = null;

    private formatType: string = "int";

    private currentTab: number = 0;

    private dialogOpen: boolean = false;

    private readonly formatters = {
        "int": x => x.toString(),
        "percent": x => numberToPercent(x),
        "2pos": x => x.toFixed(2).toString(),
    };

    private faSortSettings: FaSortSettings = new FaSortSettings(
        (x: GOAnnotation) => this.formatters[this.formatType](x["popularity"]),
        "popularity",
        "fractionOfPepts",
        "Peptides",
        (a, b) => b["popularity"] - a["popularity"]
    );

    private filteredScope: string = "";
    private numOfFilteredPepts: string = "";
    private faCalculationsInProgress: boolean = false;

    mounted() {
        this.onSelectedTaxonIdChanged();
    }

    @Watch("selectedTaxonId")
    private onSelectedTaxonIdChanged() {
        this.taxonId = this.selectedTaxonId;
    }

    private async redoCalculations() {
        this.$refs.goSummaryCard.recompute();
        this.$refs.ecSummaryCard.recompute();
        this.$refs.interproSummaryCard.recompute();
    }

    private setFormatSettings(formatType: string, fieldType: string, shadeFieldType: string, name: string): void {
        this.formatType = formatType;

        this.faSortSettings.format = (x: GOAnnotation) => this.formatters[this.formatType](x[fieldType]);
        this.faSortSettings.field = fieldType;
        this.faSortSettings.shadeField = shadeFieldType;
        this.faSortSettings.name = name;
        this.faSortSettings.sortFunc = (a, b) => b[fieldType] - a[fieldType];
    }

    @Watch("taxonId")
    private async onTaxonIdChanged() {
        if (this.dataRepository) {
            const taxaSource = await this.dataRepository.createTaxaDataSource();

            // get selecton taxon information
            if (this.selectedTaxonId != -1) {
                this.totalPeptides = taxaSource.getNrOfPeptidesByTaxonId(this.selectedTaxonId);
                this.selectedNCBITaxon = Ontologies.ncbiTaxonomy.getDefinition(this.selectedTaxonId);
            }
        }
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

    #filtered-taxon-information
    {
        background-color: #ffe57f;
    }

    .go-table-container .row {
        flex-wrap: nowrap;
    }
</style>
