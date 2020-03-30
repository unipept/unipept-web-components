<docs>
The ExperimentSummaryCard summarizes an experiment into statistics: mainly the amount of peptides that were found, the
peptides that were not found (including the ability to show these as a list). This component also allows the user to
change the currently active search settings and redo the analysis of all selected assays.
</docs>

<template>
    <v-card style="min-height: 100%; display: flex; flex-direction: column;">
        <card-header>
            <card-title>
                {{ assayName }}
            </card-title>
        </card-header>
        <v-card-text style="flex-grow: 1; display: flex; flex-direction: column;">
            <h3>Peptide list</h3>
            <v-textarea :readonly="true" v-model="peptideList"></v-textarea>
            <search-settings-form
                :disabled="disabled"
                :equate-il.sync="equateIl"
                :filter-duplicates.sync="filterDuplicates"
                :missing-cleavage.sync="missingCleavage"
                style="flex-grow: 1;">
            </search-settings-form>
            <div class="card-actions" >
                <tooltip message="Restart search with selected samples using the settings chosen above.">
                    <v-btn :disabled="disabled || exportLoading" @click="reprocess()" color="primary">
                        <v-icon left>
                            mdi-restore
                        </v-icon>
                        Update
                    </v-btn>
                </tooltip>
                <tooltip message="Download a CSV-file with the results of this analysis.">
                        <v-menu offset-y bottom left origin="top right">
                            <template v-slot:activator="{ on }">
                                <v-btn min-width="187" :disabled="disabled || exportLoading" v-on="on" color="default">
                                    <div v-if="!exportLoading">
                                        <v-icon>
                                            mdi-download
                                        </v-icon>
                                        Download results
                                        <v-icon>mdi-menu-down</v-icon>
                                    </div>
                                    <v-progress-circular v-else indeterminate color="black" :size="20">
                                    </v-progress-circular>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item @click="downloadCsv()">
                                    <v-list-item-title>Comma-separated (international)</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="downloadCsv(';', ',')">
                                    <v-list-item-title>Semi-colon-separated (Europe)</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                </tooltip>
            </div>
            <v-divider></v-divider>
            <span v-if="!activeAssay" class="dataset-placeholder-text">No dataset is selected... Wait for at least one dataset to be loaded or select one.</span>
            <span v-else class="peptide-match-text">
                We managed to match {{ matchedPeptides }} of your {{ searchedPeptides }} peptides.
                Unfortunately, <a style="cursor: pointer;" @click="showNotFoundPeptidesModal">{{ missedPeptides.length }}</a> peptides couldn't be found.
            </span>
        </v-card-text>
        <v-dialog v-model="showNotFoundModal" :width="600">
            <v-card>
                <v-card-title>
                    {{ missedPeptides.length }} missed peptides
                </v-card-title>
                <v-card-text>
                    <missing-peptides-list :dataset="activeAssay">
                    </missing-peptides-list>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import SearchSettingsForm from "../SearchSettingsForm.vue";

import CardHeader from "../../custom/CardHeader.vue";
import CardTitle from "../../custom/CardTitle.vue";
import MissingPeptidesList from "./MissingPeptidesList.vue";

import Clipboard from "clipboard";
import TaxaDataSource from "../../../logic/data-source/TaxaDataSource";
import PeptideContainer from "../../../logic/data-management/PeptideContainer";
import Tooltip from "../../custom/Tooltip.vue";
import Assay from "../../../logic/data-management/assay/Assay";
import ExportManager from "../../../logic/data-source/ExportManager";
import MetaProteomicsDataRepository from "../../../logic/data-source/repository/MetaProteomicsDataRepository";
import { downloadDataByForm } from "../../../logic/utils";
import MetaProteomicsAssay from "../../../logic/data-management/assay/MetaProteomicsAssay";

@Component({
    components: { CardTitle, CardHeader, SearchSettingsForm, Tooltip, MissingPeptidesList },
    computed: {
        peptideList: {
            get() {
                if (this.activeAssay) {
                    return this.activeAssay.peptideContainer.getPeptides().join("\n");
                } else {
                    return "";
                }
            },
            set() {
                // Do nothing (should never be triggered as textarea is readonly)
            }
        },
        assayName: {
            get() {
                if (this.activeAssay) {
                    return this.activeAssay.getName();
                } else {
                    return "Experiment Summary";
                }
            }
        }
    }
})
export default class ExperimentSummaryCard extends Vue {
    /**
     * Is the user able to interact with this component? (True if he can interact, false otherwise).
     */
    @Prop({ required: false, default: false })
    private disabled: boolean;
    /**
     * Denotes the assay that's currently been selected by the user (this is the assay for which the visualizations
     * are visible at this moment).
     */
    @Prop({ required: true })
    private activeAssay: MetaProteomicsAssay;

    // Is the export system loading?
    private exportLoading: boolean = false;

    private equateIl: boolean = true;
    private filterDuplicates: boolean = true;
    private missingCleavage: boolean = false;
    private showNotFoundModal: boolean = false;

    private searchedPeptides: number = 0;
    private matchedPeptides: number = 0;
    private missedPeptides: string[] = [];

    private loading: boolean = true;

    created() {
        this.equateIl = this.$store.getters.searchSettings.il;
        this.filterDuplicates = this.$store.getters.searchSettings.dupes;
        this.missingCleavage = this.$store.getters.searchSettings.missed;
    }

    mounted() {
        this.onActiveDatasetChanged();
    }

    reprocess(): void {
        /**
         * Fired after the user chose new settings and decided to rerun the analysis on all selected assays.
         */
        this.$emit("update-search-settings", { il: this.equateIl, dupes: this.filterDuplicates, missed: this.missingCleavage });
    }

    private showNotFoundPeptidesModal() {
        this.showNotFoundModal = true;
    }

    @Watch("activeAssay")
    private async onActiveDatasetChanged(): Promise<void> {
        if (this.activeAssay) {
            this.loading = true;
            let taxaSource: TaxaDataSource = await this.activeAssay.dataRepository.createTaxaDataSource();
            this.searchedPeptides = await taxaSource.getAmountOfSearchedPeptides();
            this.matchedPeptides = await taxaSource.getAmountOfMatchedPeptides();
            this.missedPeptides = await taxaSource.getMissedPeptides();
            this.loading = false;
        }
    }

    private async downloadCsv(separator: string = ",", functionalSeparator: string = ";"): Promise<void> {
        if (this.activeAssay) {
            this.exportLoading = true;
            const exportMng: ExportManager = new ExportManager();
            const csv: string = await exportMng.exportResultsAsCsv(
                this.activeAssay.dataRepository as MetaProteomicsDataRepository,
                separator,
                functionalSeparator,
                this.$store.getters.baseUrl
            );

            await downloadDataByForm(csv, "mpa_result.csv", "text/csv");
            this.exportLoading = false;
        }
    }
}
</script>

<style lang="less">
    @import './../../../assets/style/card.css.less';
</style>
