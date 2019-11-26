<template>
    <span v-if="!dataset || loading" style="position: relative; left: 50%; transform: translateX(-50%);">
        <v-progress-circular :size="50" :width="5" color="primary"></v-progress-circular>
    </span>
    <div v-else>
        <v-row>
            <v-col :cols="7">
                <span>
                    Sorry, we didn't manage to find {{ missedPeptides.length }} of your 
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
            <li v-for="missed of missedPeptides" :key="missed">
                <a :href="getBlastUrl(missed)" target="_blank">
                    {{ missed }}
                </a>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import Assay from "../../../logic/data-management/assay/Assay";
import TaxaDataSource from "../../../logic/data-source/TaxaDataSource";
import * as clipboard from "clipboard-polyfill";

@Component
export default class MissingPeptidesList extends Vue {
    @Prop({ required: true })
    private dataset: Assay;

    private missedPeptides: string[] = [];

    private loading: boolean = true;
    
    mounted() {
        this.missedPeptides = []
        this.onDatasetChanged();
    }

    @Watch("dataset")
    private async onDatasetChanged(): Promise<void> {
        if (this.dataset) {
            this.loading = true;
            let taxaSource: TaxaDataSource = await this.dataset.dataRepository.createTaxaDataSource();
            this.missedPeptides = await taxaSource.getMissedPeptides();
            this.loading = false;
        }
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

    private copyToClipboard() {
        clipboard.writeText(this.$store.getters.missedPeptides.join("\n"));
    }
}
</script>

<style>

</style>