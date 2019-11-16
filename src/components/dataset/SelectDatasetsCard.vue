<template>
    <v-card style="display: flex; flex-direction: column;">
        <card-header>
            <card-title>
                Metaproteomics Analysis
            </card-title>
        </card-header>
        <v-card-text style="display: flex; flex-direction: column; flex-grow: 1; padding: 0;">
            <div style="padding-top: 16px; padding-left: 16px; padding-right: 16px;">
                <h3>Selected datasets</h3>
                <span v-if="selectedDatasets.length === 0" :class="{'shaking': shaking, 'selected-placeholder': true}">Please select one or more datasets from the right hand panel to continue the analysis..</span>
            </div>
            <v-list two-line class="switch-datasets-list" style="flex-grow: 1;">
                <v-list-item v-for="dataset of selectedDatasets" two-line :key="dataset.id" >
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ dataset.getName() }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            {{ dataset.getAmountOfPeptides() }} peptides
                        </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action>
                        <v-list-item-action-text>
                            {{ dataset.getDateFormatted() }}
                        </v-list-item-action-text>
                        <tooltip message="Remove dataset from analysis.">
                            <v-btn class="fix-icon-list-position" text icon @click="deselectDataset(dataset)">
                                <v-icon color="grey darken-1">mdi-delete-outline</v-icon>
                            </v-btn>
                        </tooltip>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
            <div style="padding-bottom: 16px; padding-left: 16px; padding-right: 16px;">
                <search-settings-form
                    :equate-il="equateIl"
                    v-on:equate-il-change="equateIl = $event"
                    :filter-duplicates="filterDuplicates"
                    v-on:filter-duplicates-change="filterDuplicates = $event"
                    :missing-cleavage="missingCleavage"
                    v-on:missing-cleavage="missingCleavage = $event"
                    class="selected-dataset-settings">
                </search-settings-form>            
                <div class="card-actions">
                    <v-btn @click="search()" color="primary">
                        <v-icon left>
                            mdi-magnify
                        </v-icon>
                        Search
                    </v-btn>
                    <v-btn @click="reset()">
                        <v-icon left>
                            mdi-restore
                        </v-icon>
                        Start over
                    </v-btn>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import Assay from "./../../logic/data-management/assay/Assay";
import SearchSettingsForm from "./../analysis/SearchSettingsForm.vue";
import CardTitle from "./../custom/CardTitle.vue";
import CardHeader from "./../custom/CardHeader.vue";
import Tooltip from "./../custom/Tooltip.vue";
import { EventBus } from "./../EventBus";

@Component({
    components: { CardHeader, CardTitle, SearchSettingsForm, Tooltip }
})
export default class SelectDatasetsCard extends Vue {
    @Prop({ required: true })
    private selectedDatasets: Assay[];

    private equateIl: boolean = true;
    private filterDuplicates: boolean = true;
    private missingCleavage: boolean = false;

    private shaking: boolean = false;

    created() {
        this.updateSearchSettings();
    }

    mounted() {
        console.log("Select datasets card!");
        console.log(this.selectedDatasets);
    }

    public search(): void {
        if (this.selectedDatasets.length === 0) {
            this.shaking = true;
            // Disable the shaking effect after 300ms
            setTimeout(() => this.shaking = false, 300);
        } else {
            this.startAnalysis();
        }
    }

    private reset(): void {
        for (let dataset of this.selectedDatasets) {
            this.deselectDataset(dataset);
        }
    }

    private startAnalysis() {
        EventBus.$emit("start-analysis");
    }

    private deselectDataset(dataset: Assay) {
        EventBus.$emit("deselect-dataset", dataset);
    }

    private updateSearchSettings(equateIl: boolean = true, filterDuplicates: boolean = true, missingCleavage: boolean = true) {
        this.equateIl = equateIl;
        this.filterDuplicates = filterDuplicates;
        this.missingCleavage = missingCleavage;

        EventBus.$emit("update-search-settings", {
            il: this.equateIl,
            dupes: this.filterDuplicates, 
            missed: this.missingCleavage
        });
    }
}
</script>

<style lang="less">
    @import './../../assets/style/layout.css.less';

    .v-input__control label {
        margin-bottom: 0px;
    }

    .selected-dataset-settings {
        margin-bottom: 5px;
    }

    .switch-datasets-list {
        flex-grow: 1;
    }

    .shaking {
        animation-name: shaker;
        animation-duration: 0.2s;
        transform-origin: 50% 50%;
        animation-timing-function: linear;
    }

    @keyframes shaker {
        0% { transform: translate(5px, 0); }
        50% { transform: translate(-5px, 0); }
        100% { transform: translate(5px, 0); }
    }

    .selected-placeholder {
        display: inline-block;
    }
</style>
