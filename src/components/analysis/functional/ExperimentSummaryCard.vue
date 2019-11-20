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
            <span v-if="!$store.getters.activeDataset">No dataset is selected... Wait for at least one dataset to be loaded or select one.</span>
            <span v-else>
                We managed to match {{ $store.getters.matchedPeptides }} of your {{ $store.getters.searchedPeptides }} peptides.
                Unfortunately, <a style="cursor: pointer;" @click="showNotFoundPeptidesModal">{{ $store.getters.missedPeptides.length }}</a> peptides couldn't be found.
            </span>
        </v-card-text>
        <v-dialog v-model="showNotFoundModal" :width="600">
            <v-card>
                <v-card-title>
                    {{ $store.getters.missedPeptides.length }} missed peptides
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col :cols="7">
                            <span>
                                Sorry, we didn't manage to find {{ $store.getters.missedPeptides.length }} of your 
                                peptides. You can BLAST them by clicking the links or copy them by using the button on 
                                the right.
                            </span>
                        </v-col>
                        <v-col :cols="5">
                            <v-btn @click="copyToClipboard">
                                <v-icon left>
                                    mdi-clipboard-text-outline
                                </v-icon>
                                Copy to clipboard
                            </v-btn>
                        </v-col>
                    </v-row>
                    
                    <ul>
                        <li v-for="missed of $store.getters.missedPeptides" :key="missed">
                            <a :href="getBlastUrl(missed)" target="_blank">
                                {{ missed }}
                            </a>
                        </li>
                    </ul>
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

import Clipboard from "clipboard";
import TaxaDataSource from "../../../logic/data-source/TaxaDataSource";
import PeptideContainer from "../../../logic/data-management/PeptideContainer";
import Tooltip from "../../custom/Tooltip.vue";
import * as clipboard from "clipboard-polyfill";

@Component({
    components: { CardTitle, CardHeader, SearchSettingsForm, Tooltip }
})
export default class ExperimentSummaryCard extends Vue {
    private equateIl: boolean = true;
    private filterDuplicates: boolean = true;
    private missingCleavage: boolean = false;
    private showNotFoundModal: boolean = false;

    created() {
        this.equateIl = this.$store.getters.searchSettings.il;
        this.filterDuplicates = this.$store.getters.searchSettings.dupes;
        this.missingCleavage = this.$store.getters.searchSettings.missed;
    }

    reprocess(): void {
        this.$store.dispatch("setSearchSettings", { il: this.equateIl, dupes: this.filterDuplicates, missed: this.missingCleavage });

        this.$store.dispatch("setActiveDataset", null);
        let promises: Promise<any>[] = [];
        for (let dataset of this.$store.getters.selectedDatasets) {
            promises.push(this.$store.dispatch("processDataset", dataset));
        }
    }

    private copyToClipboard() {
        clipboard.writeText(this.$store.getters.missedPeptides.join("\n"));
    }

    private showNotFoundPeptidesModal() {
        this.showNotFoundModal = true;
    }

    private getBlastUrl(peptide: string) {
        return "http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&SET_SAVED_SEARCH=on" +
            "&USER_FORMAT_DEFAULTS=on&PAGE=Proteins&PROGRAM=blastp&QUERY=" + peptide + "&GAPCOSTS=11%201" + 
            "&EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&DATABASE=nr" +
            "&BLAST_PROGRAMS=blastp&MAX_NUM_SEQ=100&SHORT_QUERY_ADJUST=on&EXPECT=10&WORD_SIZE=3" + 
            "&MATRIX_NAME=BLOSUM62&COMPOSITION_BASED_STATISTICS=2&SHOW_OVERVIEW=on&SHOW_LINKOUT=on" + 
            "&ALIGNMENT_VIEW=Pairwise&MASK_CHAR=2&MASK_COLOR=1&GET_SEQUENCE=on&NEW_VIEW=on&NUM_OVERVIEW=100" + 
            "&DESCRIPTIONS=100&ALIGNMENTS=100&FORMAT_OBJECT=Alignment&FORMAT_TYPE=HTML&OLD_BLAST=false"
    }
}
</script>

<style lang="less">
    @import './../../../assets/style/card.css.less';
</style>
