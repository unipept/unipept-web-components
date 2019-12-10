<template>
    <div>
        <v-card>
            <v-tabs :color="tabsTextColor" :dark="isDark" v-model="currentTab" :slider-color="tabsSliderColor" :background-color="tabsColor">
                <v-tab>
                    GO Terms
                </v-tab>
                <v-tab>
                    EC Numbers
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
            <v-alert v-if="this.showTaxonInfo && this.selectedNCBITaxon && this.watchableSelectedTaxonId != -1" dense colored-border id="filtered-taxon-information">
                <v-row dense align="center">
                    <v-col class="grow"><b>Filtered results</b>: These results are limited to the {{this.totalPeptides}} peptides specific to <b>{{this.selectedNCBITaxon.name}} ({{this.selectedNCBITaxon.rank}})</b>.</v-col>
                    <v-col class="shrink">
                        <v-btn @click="doFAcalculations(); showTaxonInfo = false;">Undo</v-btn>
                    </v-col>
                </v-row>
            </v-alert>
            <v-alert v-if="!this.showTaxonInfo && this.selectedNCBITaxon && this.watchableSelectedTaxonId != -1" dense colored-border id="filtered-taxon-information">
                <v-row dense align="center">
                    <v-col class="grow"><b>Unfiltered results:</b> filtered results are available specific to {{this.selectedNCBITaxon.name}} ({{this.selectedNCBITaxon.rank}}).</v-col>
                    <v-col class="shrink">
                        <v-btn @click="redoFAcalculations(); showTaxonInfo = true;">Redo</v-btn>
                    </v-col>
                </v-row>
            </v-alert>
            <v-tabs-items v-model="currentTab">
                <v-tab-item>
                    <v-card flat>
                        <v-card-text>
                            <div v-if="!this.dataRepository" class="mpa-unavailable go">
                                <div v-if="this.analysisInProgress">
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
                                <filter-functional-annotations-dropdown v-model="percentSettings"></filter-functional-annotations-dropdown>
                                <span>This panel shows the Gene Ontology annotations that were matched to your peptides. </span>
                                <span v-html="goTrustLine"></span>
                                <span>Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
                                <div v-for="(namespace, idx) of goNamespaces" v-bind:key="namespace" style="margin-top: 16px;" class="go-table-container">
                                    <h2>{{ goData[idx].title }}</h2>
                                    <v-row>
                                        <v-col :cols="9">
                                            <go-amount-table :loading="faCalculationsInProgress" :dataRepository="dataRepository" :items="goData[idx].goTerms" :namespace="namespace" :searchSettings="faSortSettings"></go-amount-table>
                                        </v-col>
                                        <v-col :cols="3">
                                            <quick-go-card :sort-settings="faSortSettings" :items="goData[idx].goTerms"></quick-go-card>
                                        </v-col>
                                    </v-row>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card flat>
                        <v-card-text>
                            <div v-if="!this.dataRepository">
                                <span class="ec-waiting" v-if="this.analysisInProgress">
                                    <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                                </span>
                                <span v-else class="placeholder-text">
                                    Please select at least one dataset for analysis.
                                </span>
                            </div>
                            <div v-else>
                                <filter-functional-annotations-dropdown v-model="percentSettings"></filter-functional-annotations-dropdown>
                                <span>This panel shows the Enzyme Commission numbers that were matched to your peptides. </span>
                                <span v-html="ecTrustLine"></span>
                                <span>Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
                                <ec-amount-table :loading="faCalculationsInProgress" :dataRepository="dataRepository" :items="ecData" :searchSettings="faSortSettings"></ec-amount-table>
                                <v-card outlined v-if="ecTreeData">
                                    <v-btn small depressed class="item-treeview-dl-btn" @click="$refs.imageDownloadModal.downloadSVG('unipept_treeview', '#ec-treeview svg')">
                                        <v-icon>mdi-download</v-icon>
                                        Save as image
                                    </v-btn>
                                    <treeview id="ec-treeview" :data="ecTreeData" :autoResize="true" :height="300" :width="800" :tooltip="ecTreeTooltip" :enableAutoExpand="true"></treeview>
                                </v-card>
                            </div>
                        </v-card-text>
                    </v-card>
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
import MpaAnalysisManager from "../../../logic/data-management/MpaAnalysisManager";
import FaSortSettings from "../../tables/FaSortSettings";
import { numberToPercent, stringTitleize } from "../../../logic/utils";
import PeptideContainer from "../../../logic/data-management/PeptideContainer";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";

import IndeterminateProgressBar from "../../custom/IndeterminateProgressBar.vue";
import CardHeader from "../../custom/CardHeader.vue";
import QuickGoCard from "./QuickGOCard.vue";

import ImageDownloadModal from "../../utils/ImageDownloadModal.vue";
import { showInfoModal } from "../../../logic/modal";
import DataRepository from "../../../logic/data-source/DataRepository";
import GoDataSource from "../../../logic/data-source/GoDataSource";
import { GoNameSpace } from "../../../logic/functional-annotations/GoNameSpace";
import GoTerm from "../../../logic/functional-annotations/GoTerm";
import GoAmountTable from "../../tables/GoAmountTable.vue";
import TaxaDataSource from "../../../logic/data-source/TaxaDataSource";
import EcNumber from "../../../logic/functional-annotations/EcNumber";
import EcDataSource from "../../../logic/data-source/EcDataSource";
import EcAmountTable from "../../tables/EcAmountTable.vue";
import TreeViewNode from "../../visualizations/TreeViewNode";
import Treeview from "../../visualizations/Treeview.vue";
import FATrust from "../../../logic/functional-annotations/FATrust";

import { NCBITaxon } from "../../../logic/data-management/ontology/taxa/NCBITaxon";
import { NCBITaxonomy } from "../../../logic/data-management/ontology/taxa/NCBITaxonomy";
import { Ontologies } from "../../../logic/data-management/ontology/Ontologies";

@Component({
    components: {
        CardHeader,
        IndeterminateProgressBar,
        FilterFunctionalAnnotationsDropdown,
        GoAmountTable,
        EcAmountTable,
        Treeview,
        QuickGoCard,
        ImageDownloadModal
    },
    computed: {
        watchableDataset: {
            get(): PeptideContainer {
                return this.$store.getters.activeDataset
            }
        },
        watchableSelectedSearchTerm: {
            get(): string {
                return this.$store.getters.selectedTerm
            }
        },
        watchableSelectedTaxonId: {
            get(): string {
                return this.$store.getters.selectedTaxonId;
            }
        }
    }
})
export default class FunctionalSummaryCard extends Vue {
    $refs!: {
        imageDownloadModal: ImageDownloadModal
    }
    
    @Prop({ required: true })
    private dataRepository: DataRepository;
    @Prop({ required: false, default: true })
    private analysisInProgress: boolean;
    @Prop({ required: false, default: "primary" })
    private tabsColor: string;
    @Prop({ required: false, default: "secondary" })
    private tabsSliderColor: string;
    @Prop({ required: false, default: "white" })
    private tabsTextColor: string;
    @Prop({ required: false, default: true })
    private isDark: boolean;

    private totalPeptides: number = 0;
    private selectedNCBITaxon: NCBITaxon = null; 
    private showTaxonInfo: boolean = false;

    // We need to define all namespaces as a list here, as Vue templates cannot access the GoNameSpace class 
    // directly
    private goNamespaces: GoNameSpace[] = Object.values(GoNameSpace).sort();
    private goData: {goTerms: GoTerm[], title: string}[] = [];

    private ecData: EcNumber[] = [];
    private ecTreeData: TreeViewNode = null;

    private ecTrustLine: string = "";
    private goTrustLine: string = "";

    private formatType: string = "int";

    private currentTab: number = 0;

    private dialogOpen: boolean = false;

    private ecTreeTooltip: (d: any) => string = (d: any) => {
        const fullCode = (d.name + ".-.-.-.-").split(".").splice(0, 4).join(".");
        let tip = "";
        tip += `<div class="tooltip-fa-text">
                    <strong>${d.data.count} peptides</strong> have at least one EC number within ${fullCode},<br>`;

        if (d.data.self_count == 0) {
            tip += "no specific annotations";
        } else {
            if (d.data.self_count == d.data.count) {
                tip += " <strong>all specifically</strong> for this number";
            } else {
                tip += ` <strong>${d.data.self_count} specificly</strong> for this number`;
            }
        }

        tip += "</div>";
        return tip;
    };

    private readonly formatters = {
        "int": x => x.toString(),
        "percent": x => numberToPercent(x),
        "2pos": x => x.toFixed(2).toString(),
    };

    private faSortSettings: FaSortSettings = new FaSortSettings(
        (x: GoTerm) => this.formatters[this.formatType](x["popularity"]),
        "popularity",
        "fractionOfPepts",
        "Peptides",
        (a, b) => b["popularity"] - a["popularity"]
    );

    private percentSettings: string = "5";

    private filteredScope: string = "";
    private numOfFilteredPepts: string = "";
    private faCalculationsInProgress: boolean = false;

    mounted() {
        for (let ns of this.goNamespaces) {
            this.goData.push({
                goTerms: [],
                title: stringTitleize(ns.toString())
            });
        }
        this.onDataRepositoryChanged();
    }

    @Watch("dataRepository") onDataRepositoryChange() {
        this.onDataRepositoryChanged();
    }

    @Watch("percentSettings") onPercentSettingsChange() {
        this.onDataRepositoryChanged();
    }
    
    @Watch("watchableSelectedTaxonId") onWatchableSelectedTaxonIdChanged() {
        this.onDataRepositoryChanged();
        this.getSelectedTaxonInfo();
    }

    setFormatSettings(formatType: string, fieldType: string, shadeFieldType: string, name: string): void {
        this.formatType = formatType;

        this.faSortSettings.format = (x: GoTerm) => this.formatters[this.formatType](x[fieldType]);
        this.faSortSettings.field = fieldType;
        this.faSortSettings.shadeField = shadeFieldType;
        this.faSortSettings.name = name;
        this.faSortSettings.sortFunc = (a, b) => b[fieldType] - a[fieldType];

        // Recalculate stuff
        this.onDataRepositoryChanged();
    }

    reset() {
        this.$store.dispatch("setSelectedTerm", "Organism");
        this.$store.dispatch("setSelectedTaxonId", -1);
    }

    private async onDataRepositoryChanged() {
        this.faCalculationsInProgress = true;
        if (this.dataRepository) {
            await this.redoFAcalculations();
        }
        this.faCalculationsInProgress = false;
    }

    private async getSelectedTaxonInfo() {
        if (this.dataRepository) {
            const taxaSource = await this.dataRepository.createTaxaDataSource();
            const taxonId = this.$store.getters.selectedTaxonId;

            // get selecton taxon information
            if (taxonId != -1) {
                this.totalPeptides = taxaSource.getNrOfPeptidesByTaxonId(taxonId);
                this.selectedNCBITaxon = Ontologies.ncbiTaxonomy.getDefinition(taxonId);
                this.showTaxonInfo = true;
            }
        }
    }

    private async redoFAcalculations(): Promise<void> {
        if (this.dataRepository) {
            let taxaSource: TaxaDataSource = await this.dataRepository.createTaxaDataSource();
            const taxonId = this.$store.getters.selectedTaxonId;

            // get sequences corresponding to selected taxon id
            let sequences = null;
            if (taxonId > 0) {
                let tree = await taxaSource.getTree();
                sequences = tree.getAllSequences(taxonId);
                let taxonData = tree.nodes.get(taxonId);
                this.filteredScope = `${taxonData.name} (${taxonData.rank})`;
            }

            await this.doFAcalculations(sequences);
        }
    }

    private async doFAcalculations(sequences: string[] = null) {
        if (this.dataRepository) {
            let goSource: GoDataSource = await this.dataRepository.createGoDataSource();
            let ecSource: EcDataSource = await this.dataRepository.createEcDataSource();

            const percent = parseInt(this.percentSettings);

            // recalculate go-data for those sequences
            for (let i = 0; i < this.goNamespaces.length; i++) {
                let namespace: GoNameSpace = this.goNamespaces[i];
                this.goData[i].goTerms = await goSource.getGoTerms(namespace, percent, sequences);
            }

            this.goTrustLine = this.computeTrustLine(await goSource.getTrust(null, percent, sequences), "GO term");

            // recalculate ec-data for those sequences
            this.ecData = await ecSource.getEcNumbers(null, percent, sequences);
            this.ecTrustLine = this.computeTrustLine(await ecSource.getTrust(null, percent, sequences), "EC number");
            // @ts-ignore
            this.ecTreeData = await ecSource.getEcTree(null, percent, sequences);
        }
    }

    /**
     * Generate a tooltip for an EC number
     * 
     * @param  ecNumber   The EC number to generate a tooltip for
     * @return {string}    HTML for the tooltip
     */
    private tooltipEC(ecNumber: EcNumber) {
        // const fmt = x => `<div class="tooltip-ec-ancestor"><span class="tooltip-ec-term">EC ${x}</span><span class="tooltip-ec-name">${ECNumbers.nameOf(x)}</span></div>`;
        // const fmth = x => `<div class="tooltip-ec-ancestor tooltip-ec-current"><span class="tooltip-ec-term">EC ${x}</span><h4 class="tooltip-fa-title">${ECNumbers.nameOf(x)}</h4></div>`;

        // let result = "";

        // if (ECNumbers.ancestorsOf(ecNumber).length > 0) {
        //     result += `${ECNumbers.ancestorsOf(ecNumber).reverse().map(c => fmt(c)).join("\n")}`;
        // }
        // result += fmth(ecNumber);

        // result += this.tootipResultSet(ecNumber, ecResultSet, oldEcResultSet);
        // return result;
        return "";
    }

    /**
     * Creates a line indicating the trust of the function annotations
     * 
     * @param trust The FATrust object that contains all necessary trust information.
     * @param kind Human readable word that fits in "To have at least one … assigned to it"
     * @return
     */
    private computeTrustLine(trust: FATrust, kind: string): string {
        if (trust.annotatedCount === 0) {
            return `<strong>No peptide</strong> has a ${kind} assigned to it. `;
        }
        if (trust.annotatedCount === trust.totalCount) {
            return `<strong>All peptides</strong> ${trust.annotatedCount <= 5 ? `(only ${trust.annotatedCount})` : ""} have at least one ${kind} assigned to them. `;
        }
        if (trust.annotatedCount === 1) {
            return `Only <strong>one peptide</strong> (${numberToPercent(trust.annotatedCount / trust.totalCount)}) has at least one ${kind} assigned to it. `;
        }
        return `<strong>${trust.annotatedCount} peptides</strong> (${numberToPercent(trust.annotatedCount / trust.totalCount)}) have at least one ${kind} assigned to them. `;
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

    .go-waiting, .ec-waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        display: flex;
    }

    .unipept-web-app .go-waiting {
        justify-content: center;
    }

    .unipept-web-app .ec-waiting {
        justify-content: center;
    }

    #filtered-taxon-information
    {
        background-color: #ffe57f;
    }

    .go-table-container .row {
        flex-wrap: nowrap;
    }
</style>
