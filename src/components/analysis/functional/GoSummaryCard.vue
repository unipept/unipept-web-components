<template>
    <v-card flat>
        <v-card-text>
            <div v-if="!dataRepository" class="mpa-unavailable go">
                <div v-if="analysisInProgress">
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
                <span v-html="trustLine"></span>
                <span>Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
                <div v-for="(namespace, idx) of namespaces" v-bind:key="namespace" style="margin-top: 16px;" class="go-table-container">
                    <h2>{{ items[idx].title }}</h2>
                    <v-row>
                        <v-col :cols="9">
                            <go-amount-table :loading="calculationsInProgress" :dataRepository="dataRepository" :items="items[idx].goTerms" :namespace="namespace" :searchSettings="sortSettings"></go-amount-table>
                        </v-col>
                        <v-col :cols="3">
                            <quick-go-card :sort-settings="sortSettings" :items="items[idx].goTerms"></quick-go-card>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import FunctionalSummaryMixin from "./FunctionalSummaryMixin.vue";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";
import GoAmountTable from "../../tables/GoAmountTable.vue";
import QuickGoCard from "./QuickGOCard.vue";
import { GoNameSpace } from "../../../logic/functional-annotations/GoNameSpace";
import GoTerm from "../../../logic/functional-annotations/GoTerm";
import GoDataSource from "../../../logic/data-source/GoDataSource";
import { numberToPercent, stringTitleize } from "../../../logic/utils";

@Component({
    components: {
        FilterFunctionalAnnotationsDropdown,
        GoAmountTable,
        QuickGoCard
    }
})
export default class GoSummaryCard extends mixins(FunctionalSummaryMixin) {
    private namespaces: GoNameSpace[] = Object.values(GoNameSpace).sort();
    private items: {goTerms: GoTerm[], title: string}[] = [];
    private trustLine: string = "";
    private calculationsInProgress: boolean = false;

    mounted() {
        for (let ns of this.namespaces) {
            this.items.push({
                goTerms: [],
                title: stringTitleize(ns.toString())
            });
        }

        this.recompute();
    }

    public async recompute() {
        this.calculationsInProgress = true;
        if (this.dataRepository) {
            const goSource: GoDataSource = await this.dataRepository.createGoDataSource();
            const percent = parseInt(this.percentSettings);
            const sequences = await this.getSequences();

            // recalculate go-data for those sequences
            for (let i = 0; i < this.namespaces.length; i++) {
                let namespace: GoNameSpace = this.namespaces[i];
                this.items[i].goTerms = await goSource.getGoTerms(namespace, percent, sequences);
            }

            this.trustLine = this.computeTrustLine(await goSource.getTrust(null, percent, sequences), "GO term");
        }
        this.calculationsInProgress = false;
    }
}
</script>

<style>
    .go-waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        position: relative;
        transform: translateX(-50%), translate(-25px);
    }

    .go-table-container .row {
        flex-wrap: nowrap;
    }
</style>