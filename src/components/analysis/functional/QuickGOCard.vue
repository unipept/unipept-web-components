<template>
    <div style="height: 100%;">
        <img v-if="items" style="max-width: 100%; max-height: 300px; position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); cursor: pointer;" :src="getQuickGoSmallUrl()" class="quickGoThumb" @click="showModal = !showModal">
        <v-dialog v-if="items" v-model="showModal" max-width="90%">
            <v-card>
                <v-card-title>QuickGo biological process</v-card-title>
                <v-card-text v-if="top5 && top5.length > 0">
                    This chart shows the relationship between the {{ top5.length }} most occurring GO terms: 
                    {{ top5Sentence }}.
                    <br/>
                    <a @click="openInBrowser(quickGOChartURL(top5.map(x => x.code), true))">
                        <img style="max-width: 100%; position: relative; left: 50%; transform: translateX(-50%);" :src="quickGOChartURL(top5.map(x => x.code), true)" :alt="'QuickGO chart of ' + top5Sentence"/>
                    </a>
                    <div>
                        Provided by <a @click="openInBrowser('https://www.ebi.ac.uk/QuickGO/annotations?goId=' + top5.map(x => x.code).join(','))" target="_blank">QuickGO</a>.
                    </div>
                </v-card-text>
                <v-card-text v-else>
                    No GO terms for this domain were found.
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import GoTerm from "./../../../logic/functional-annotations/GoTerm";
import FaSortSettings from "../../tables/FaSortSettings";
import { GoNameSpace } from "./../../../logic/functional-annotations/GoNameSpace";
import Utils from "./../../custom/Utils";

@Component
export default class QuickGOCard extends Vue {
    @Prop({ required: true })
    private items: GoTerm[];
    @Prop({ required: true })
    private sortSettings: FaSortSettings;

    private top5: GoTerm[] = null;
    private top5Sentence: string = "";

    private showModal: boolean = false;

    mounted() {
        this.initialize();
    }

    @Watch("items")
    private initialize() {
        if (this.items) {
            this.top5 = this.items.slice(0, 5);

            if (this.top5.length > 0) {
                const top5WithNames = this.top5.map(x => `${x.name} (${this.sortSettings.format(x)})`);
                this.top5Sentence = top5WithNames.slice(0, -1).join(", ") + (this.top5.length > 1 ? " and " : "") + top5WithNames[top5WithNames.length - 1];
            }
        }
    }

    private getQuickGoSmallUrl(): string {
        const top5: string[] = this.items.slice(0, 5).map(x => x.code);

        if (top5.length > 0) {
            return this.quickGOChartURL(top5, false);
        }
        return null;
    }

    /**
     * @param {string[]} terms the terms to show in the chart (at least one)
     * @param {boolean} showKey Show the legend of the colors
     * @return {string} The QuickGo chart URL of the given GO terms
     */
    private quickGOChartURL(terms, showKey = true): string {
        // sort the terms to improve caching
        return `https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/${terms.sort().join(",")}/chart?showKey=${showKey}`;
    }

    private openInBrowser(url) {
        Utils.openInBrowser(url);
    }
}
</script>

<style>

</style>