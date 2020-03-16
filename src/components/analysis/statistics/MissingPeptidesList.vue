<template>
    <div style="margin-top: 16px;">
        <div>
            Sorry, we didn't manage to find {{ missedPeptides.length }} of your
            peptides. You can BLAST them by clicking the links or copy them by using the button below.
        </div>

        <v-data-table :headers="headers" :items="missedPeptides" :items-per-page="10">
            <template v-slot:item.action="{ item }">
                <tooltip message="BLAST this peptide in an external window.">
                    <v-icon @click="openBlastUrl(item)">mdi-open-in-new</v-icon>
                </tooltip>
            </template>
        </v-data-table>

        <div
            style="margin-top: 8px; margin-bottom: 8px; display: flex; justify-content: center;"
            class="copy-button-container">
            <v-btn @click="copyToClipboard" color="primary">
                <v-icon left>
                    mdi-clipboard-text-outline
                </v-icon>
                Copy all to clipboard
            </v-btn>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import * as clipboard from "clipboard-polyfill";
import Utils from "./../../custom/Utils";
import Tooltip from "./../../custom/Tooltip.vue";
import { Peptide } from "@/business/ontology/raw/Peptide";

@Component({
    components: {
        Tooltip
    }
})
export default class MissingPeptidesList extends Vue {
    @Prop({ required: true })
    private missedPeptides: Peptide[] = [];

    private loading: boolean = true;

    private headers = [
        {
            text: "Peptide",
            align: "left",
            sortable: true,
            width: "80%",
            value: "value"
        },
        {
            text: "Actions",
            align: "center",
            sortable: false,
            width: "20%",
            value: "action"
        }
    ]

    private openBlastUrl(peptide: string) {
        const url: string = "http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&SET_SAVED_SEARCH=on" +
            "&USER_FORMAT_DEFAULTS=on&PAGE=Proteins&PROGRAM=blastp&QUERY=" + peptide + "&GAPCOSTS=11%201" +
            "&EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&DATABASE=nr" +
            "&BLAST_PROGRAMS=blastp&MAX_NUM_SEQ=100&SHORT_QUERY_ADJUST=on&EXPECT=10&WORD_SIZE=3" +
            "&MATRIX_NAME=BLOSUM62&COMPOSITION_BASED_STATISTICS=2&SHOW_OVERVIEW=on&SHOW_LINKOUT=on" +
            "&ALIGNMENT_VIEW=Pairwise&MASK_CHAR=2&MASK_COLOR=1&GET_SEQUENCE=on&NEW_VIEW=on&NUM_OVERVIEW=100" +
            "&DESCRIPTIONS=100&ALIGNMENTS=100&FORMAT_OBJECT=Alignment&FORMAT_TYPE=HTML&OLD_BLAST=false"
        Utils.openInBrowser(url);
    }

    private copyToClipboard() {
        clipboard.writeText(this.missedPeptides.join("\n"));
    }
}
</script>

<style>

</style>
