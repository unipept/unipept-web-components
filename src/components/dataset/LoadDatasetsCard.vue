<template>
    <v-card>
        <v-tabs grow :dark="isDark" :color="tabsTextColor" :background-color="tabsColor" :slider-color="tabsSliderColor" v-model="currentTab">
            <v-tab>
                Create
            </v-tab>
            <v-tab>
                Sample data
            </v-tab>
            <v-tab>
                Pride
            </v-tab>
            <v-tab>
                Local data
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="currentTab">
            <v-tab-item>
                <create-dataset-card></create-dataset-card>
            </v-tab-item>
            
            <v-tab-item>
                <load-sample-dataset-card :selected-datasets="selectedDatasets"></load-sample-dataset-card>
            </v-tab-item>
            
            <v-tab-item>
                <load-pride-dataset-card></load-pride-dataset-card>
            </v-tab-item>
            
            <v-tab-item>
                <v-card flat>
                    <v-card-text v-if="storedDatasets.length === 0">
                        <span>There are currently no datasets present in your browser's local storage.</span>
                    </v-card-text>
                    <v-list two-line>
                        <template v-for="dataset of storedDatasets">
                            <v-list-item :key="dataset.id" ripple @click="selectDataset(dataset)">
                                <v-list-item-action>
                                    <tooltip message="Select this dataset for analysis.">
                                        <v-icon>mdi-plus</v-icon>
                                    </tooltip>
                                </v-list-item-action>
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
                                    <tooltip message="Delete this sample from local storage.">
                                        <v-btn icon text @click="deleteDataset(dataset)" v-on:click.stop>
                                            <v-icon color="grey darken-1">mdi-close</v-icon>
                                        </v-btn>
                                    </tooltip>
                                </v-list-item-action>
                            </v-list-item>
                        </template>
                    </v-list>
                </v-card>
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";

import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import DatasetForm from "./DatasetForm.vue";
import Assay from "../../logic/data-management/assay/Assay";
import MetaProteomicsAssay from "../../logic/data-management/assay/MetaProteomicsAssay";
import DatasetManager from "../../logic/data-management/DatasetManager";
import { StorageType } from "../../logic/data-management/StorageType";
// TODO can be migrated to Vuetify snackbar!
import Snackbar from "../custom/Snackbar.vue";
import axios from "axios"
import CreateDatasetCard from "./CreateDatasetCard.vue";
import LoadSampleDatasetCard from "./LoadSampleDatasetCard.vue";
import LoadPrideDatasetCard from "./LoadPrideDatasetCard.vue";

import SampleDataset from "../../logic/data-management/SampleDataset";
import Tooltip from "../custom/Tooltip.vue";
import SampleDatasetCollection from "../../logic/data-management/SampleDatasetCollection";
import StorageWriter from "../../logic/data-management/visitors/storage/StorageWriter";
import { EventBus } from "../EventBus";

@Component({
    components: {
        Snackbar,
        DatasetForm,
        Tooltip,
        CreateDatasetCard,
        LoadSampleDatasetCard,
        LoadPrideDatasetCard
    },
    computed: {
        baseUrl: {
            get(): string {
                return this.$store.getters.baseUrl;
            }
        }
    }
})
export default class LoadDatasetsCard extends Vue {
    @Prop({ required: true })
    private selectedDatasets: Assay[];
    @Prop({ required: true })
    private storedDatasets: Assay[];
    @Prop({ required: false, default: "primary" })
    private tabsColor: string;
    @Prop({ required: false, default: "secondary" })
    private tabsSliderColor: string;
    @Prop({ required: false, default: "white" })
    private tabsTextColor: string;
    @Prop({ required: false, default: true })
    private isDark: boolean;

    private currentTab: number = 0;

    private sampleDatasets: SampleDatasetCollection[] = [];

    private pendingStore: boolean = false;

    private loadingSampleDatasets: boolean = true;
    private errorSampleDatasets: boolean = false;
    private selectedSampleDataset = {};

    private selectDataset(dataset: Assay): void {
        EventBus.$emit("select-dataset", dataset);
    }

    private deleteDataset(dataset: Assay): void {
        this.$store.dispatch("deleteDataset", dataset);
        EventBus.$emit("delete-dataset", dataset);
    }
}
</script>

<style lang="less">
    @import './../../assets/style/layout.css.less';
    @import './../../assets/style/tabs.css.less';
    @import './../../assets/style/card.css.less';

    .peptide-amount-wrapper {
        display: flex !important;
        flex-direction: row;
        justify-content: space-between;
    }

    .load-sample-container .row {
        flex-wrap: nowrap;
    }
</style>
