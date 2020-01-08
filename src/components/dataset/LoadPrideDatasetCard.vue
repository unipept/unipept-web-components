<docs>
The `LoadPrideDatasetCard` allows the user to load any dataset from the PRIDE-archive. The user enters a valid PRIDE id 
after which the required information is downloaded and transformed into an Assay.
</docs>

<template>
    <v-card flat>
        <v-card-text>
            <h3>Load data from the PRIDE archive</h3>
            <p>You can easily load data from the <a href="http://www.ebi.ac.uk/pride/" target="_blank">PRIDE</a> data repository. Simply enter an assay id (e.g. 8500) in the field below and click the 'Load PRIDE Dataset' button. The corresponding dataset will then be fetched using the PRIDE API and loaded into the search form on the left.</p>
            <v-form ref="prideAssayForm" @submit.prevent>
                <v-text-field label="Assay id" placeholder="e.g. 8500" :disabled="prideLoading" v-model="prideAssay" :rules="[value => !!value || 'Please enter a valid PRIDE assay number']" clearable></v-text-field>
            </v-form>
            <div class="card-actions">
                <v-btn v-if="!prideLoading" @click="fetchPrideAssay()">
                    <v-icon left>mdi-cloud-download</v-icon>
                    Fetch PRIDE dataset
                </v-btn>
                <v-progress-linear v-if="prideLoading" v-model="prideProgress"></v-progress-linear>
            </div>
            <dataset-form ref="prideDatasetForm" v-on:peptide-change="pridePeptides = $event" :peptides="pridePeptides" v-on:name-change="prideName = $event" :name="prideName" v-on:save-change="prideSave = $event" :save="prideSave" :loading="prideLoading"></dataset-form>
            <div class="card-actions">
                <v-btn :disabled="prideLoading" @click="selectPrideAssay()">
                    <v-icon left>mdi-plus</v-icon>
                    Add to selected datasets
                </v-btn>
            </div>
            <snackbar :timeout="0" ref="prideSnackbar">Loading dataset... <div class="spinner"></div></snackbar>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component"
import DatasetMixin from "./DatasetMixin.vue";
import DatasetManager from "../../logic/data-management/DatasetManager";
import DatasetForm from "./DatasetForm.vue";
import Snackbar from "../custom/Snackbar.vue";

@Component({
    components: {
        Snackbar,
        DatasetForm
    }
})
export default class LoadPrideDatasetCard extends mixins(DatasetMixin) {
    $refs!: {
        prideAssayForm: any,
        prideDatasetForm: DatasetForm,
        prideSnackbar: Snackbar
    }

    private prideAssay: string = "";
    private pridePeptides: string = "";
    private prideName: string = "";
    private prideSave: boolean = true;
    private prideLoading: boolean = false;
    private prideProgress: number = 0;

    private fetchPrideAssay(): void {
        if (this.$refs.prideAssayForm.validate()) {
            this.prideLoading = true;
            let datasetManager: DatasetManager = new DatasetManager();
            let prideNumber: number = parseInt(this.prideAssay);

            this.prideName = "PRIDE assay " + prideNumber.toString();

            this.$refs.prideSnackbar.show();
            datasetManager
                .loadPrideDataset(prideNumber, (progress) => this.prideProgress = progress * 100)
                .then((peptides) => {
                    this.pridePeptides = peptides.join("\n");
                    this.prideLoading = false;
                    this.$refs.prideSnackbar.destroy();
                });
        }
    }

    private selectPrideAssay() {
        if (this.$refs.prideDatasetForm.isValid()) {
            this.storeDataset(this.pridePeptides, this.prideName, this.prideSave);
        }
    }
}
</script>

<style lang="less" scoped>
</style>
