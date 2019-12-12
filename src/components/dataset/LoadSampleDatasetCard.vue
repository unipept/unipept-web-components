<docs>
The `LoadSampleDatasetCard` asynchronously downloads all sample datasets that are present in the Unipept database and 
provides the user with the option to select any one of these.
</docs>

<template>
    <v-card flat>
        <v-card-text>
            <div v-if="loadingSampleDatasets" style="display: flex;">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else-if="errorSampleDatasets">
                <v-alert type="error">
                    Unable to retrieve list of sample datasets.
                </v-alert>
            </div>
            <div v-else v-for="dataset of sampleDatasets" v-bind:key="dataset.id">
                <b>Environment:</b> {{ dataset.environment }}
                <br>
                <b>Reference:</b>
                <small>
                    {{ dataset.reference }}
                    <a target="_blank" title="Article website" :href="dataset.url">
                        <span class="glyphicon glyphicon-link"></span>
                    </a>
                    <a target="_blank" title="Project website" :href="dataset.projectWebsite">
                        <span class="glyphicon glyphicon-share-alt"></span>
                    </a>
                </small>
                <br>
                <div class="load-sample-container">
                    <v-row>
                        <v-col :cols="7">
                            <v-select 
                                :items="dataset.datasets" 
                                item-text="name" 
                                v-model="selectedSampleDataset[dataset.id]">
                            </v-select>
                        </v-col>
                        <v-col :cols="5" style="display: flex; align-items: center;">
                            <v-btn @click="selectSampleDataset(dataset.id)">Load dataset</v-btn>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component"
import DatasetMixin from "./DatasetMixin.vue";
import { Watch, Prop } from "vue-property-decorator";
import axios from "axios";
import SampleDatasetCollection from "../../logic/data-management/SampleDatasetCollection";
import Assay from "../../logic/data-management/assay/Assay";
import SampleDataset from "../../logic/data-management/SampleDataset";

@Component({
    computed: {
        baseUrl: {
            get(): string {
                return this.$store.getters.baseUrl;
            }
        }
    }
})
export default class LoadSampleDatasetCard extends mixins(DatasetMixin) {
    private loadingSampleDatasets: boolean = true;
    private errorSampleDatasets: boolean = false;
    private selectedSampleDataset = {};

    private sampleDatasets: SampleDatasetCollection[] = [];

    mounted() {
        this.retrieveSampleDatasets();
    }

    @Watch("baseUrl")
    private retrieveSampleDatasets() {
        this.loadingSampleDatasets = true;
        this.errorSampleDatasets = false;
        axios.post(this.$store.getters.baseUrl + "/datasets/sampledata")
            .then(result => {
                this.sampleDatasets = [];
                this.selectedSampleDataset = {};
                for (let item of result.data.sample_data) {
                    let itemDatasets = item.datasets.map((el) => new SampleDataset(el.name, el.data, el.order));
                    itemDatasets = itemDatasets.sort((a, b) => {
                        return a.order < b.order;
                    });
                    this.sampleDatasets.push(new SampleDatasetCollection(
                        item.id,
                        item.environment,
                        item.project_website,
                        item.reference,
                        item.url,
                        itemDatasets
                    ));
                    this.selectedSampleDataset[item.id] = itemDatasets[0].name;
                }
            })
            .catch((error) => {
                this.errorSampleDatasets = true;
            })
            .finally(() => this.loadingSampleDatasets = false);
    }

    private selectSampleDataset(datasetId: string) {
        let name: string = this.selectedSampleDataset[datasetId];
        // Only datasets with a valid name can be selected.
        if (name) {
            let sampleDatasetCollection: SampleDatasetCollection = this.sampleDatasets.find(
                (dataset) => dataset.id == datasetId
            );
            let sampleSet: SampleDataset = sampleDatasetCollection.datasets.find(
                (dataset) => dataset.name == this.selectedSampleDataset[datasetId]
            );
            this.storeDataset(sampleSet.data.join("\n"), sampleSet.name, false);
        }
    }
}
</script>

<style lang="less" scoped>
</style>
