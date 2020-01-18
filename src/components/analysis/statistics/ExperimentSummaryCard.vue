<docs>
The ExperimentSummaryCard summarizes an experiment into statistics: mainly the amount of peptides that were found, the 
peptides that were not found (including the ability to show these as a list). This component also allows the user to
change the currently active search settings and redo the analysis of all selected assays.
</docs>

<template>
    <v-card style="min-height: 100%; display: flex; flex-direction: column;">
        <card-header>
            <card-title>
                Experiment Summary
            </card-title>
        </card-header>
        <v-card-text style="flex-grow: 1; display: flex; flex-direction: column;">
            <search-settings-form
                :disabled="$store.getters.selectedDatasets.some(el => el.progress !== 1)"
                :equate-il.sync="equateIl"
                :filter-duplicates.sync="filterDuplicates"
                :missing-cleavage.sync="missingCleavage"
                style="flex-grow: 1;">
            </search-settings-form>
            <div class="card-actions" >
                <tooltip message="Restart search with selected samples using the settings chosen above.">
                    <v-btn :disabled="$store.getters.selectedDatasets.some(el => el.progress !== 1)" @click="reprocess()" color="primary">
                        <v-icon left>
                            mdi-restore
                        </v-icon>
                        Update
                    </v-btn>
                </tooltip>
                <tooltip message="Download a CSV-file with the results of this analysis.">
                    <v-btn :disabled="$store.getters.selectedDatasets.some(el => el.progres !== 1)" @click="downloadCsv()" color="default">
                        <v-icon>
                            mdi-download
                        </v-icon>
                        Download results
                    </v-btn>
                </tooltip>
            </div>
            <v-divider></v-divider>
            <span v-if="!activeAssay">No dataset is selected... Wait for at least one dataset to be loaded or select one.</span>
            <span v-else>
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

@Component({
    components: { CardTitle, CardHeader, SearchSettingsForm, Tooltip, MissingPeptidesList }
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
    private activeAssay: Assay;

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

    private async downloadCsv(): Promise<void> {
        if (this.activeAssay) {
            const taxaDataSource: TaxaDataSource = await this.activeAssay.dataRepository.createTaxaDataSource();
            await taxaDataSource.toCSV();
        }
    }
}
</script>

<style lang="less">
    @import './../../../assets/style/card.css.less';
</style>
