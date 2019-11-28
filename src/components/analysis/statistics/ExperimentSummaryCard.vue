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
                    <v-btn :disabled="$store.getters.selectedDatasets.some(el => el.progress !== 1)" @click="reprocess()" color="primary"><v-icon left>mdi-restore</v-icon>Update</v-btn>
                </tooltip>
            </div>
            <v-divider></v-divider>
            <span v-if="!$store.getters.activeDataset" class="dataset-placeholder-text">No dataset is selected... Wait for at least one dataset to be loaded or select one.</span>
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
                    <missing-peptides-list :dataset="$store.getters.activeDataset">
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

@Component({
    components: { CardTitle, CardHeader, SearchSettingsForm, Tooltip, MissingPeptidesList },
    computed: {
        activeDataset() {
            return this.$store.getters.activeDataset;
        }
    }
})
export default class ExperimentSummaryCard extends Vue {
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
        this.$store.dispatch("setSearchSettings", { il: this.equateIl, dupes: this.filterDuplicates, missed: this.missingCleavage });

        this.$store.dispatch("setActiveDataset", null);
        let promises: Promise<any>[] = [];
        for (let dataset of this.$store.getters.selectedDatasets) {
            promises.push(this.$store.dispatch("processDataset", dataset));
        }
    }

    private showNotFoundPeptidesModal() {
        this.showNotFoundModal = true;
    }

    @Watch("activeDataset")
    private async onActiveDatasetChanged(): Promise<void> {
        if (this.$store.getters.activeDataset) {
            this.loading = true;
            let taxaSource: TaxaDataSource = await this.$store.getters.activeDataset.dataRepository.createTaxaDataSource();
            this.searchedPeptides = await taxaSource.getAmountOfSearchedPeptides();
            this.matchedPeptides = await taxaSource.getAmountOfMatchedPeptides();
            this.missedPeptides = await taxaSource.getMissedPeptides();
            console.log(this.searchedPeptides);
            console.log(this.matchedPeptides);
            this.loading = false;
        }
    }
}
</script>

<style lang="less">
    @import './../../../assets/style/card.css.less';
</style>
