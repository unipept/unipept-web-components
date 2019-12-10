<template>
    <v-card flat>
        <v-card-text>
            <dataset-form ref="createdDatasetForm" 
                v-on:peptide-change="createPeptides = $event" 
                :peptides="createPeptides" 
                v-on:name-change="createName = $event" 
                :name="createName" 
                v-on:save-change="createSave = $event" 
                :save="createSave" 
                :loading="pendingStore">
            </dataset-form>
            <div class="card-actions">
                <v-btn :disabled="pendingStore" @click="storeCreatedDataset()">
                    <v-icon left>mdi-plus</v-icon>
                    Add to selected datasets
                </v-btn>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component"
import DatasetMixin from "./DatasetMixin.vue";

@Component
export default class CreateDatasetCard extends mixins(DatasetMixin) {
    protected createPeptides: string = "";
    protected createName: string = "";
    private createSave: boolean = true;

    private storeCreatedDataset() {
        // @ts-ignore
        if (this.$refs.createdDatasetForm.isValid()) {
            this.storeDataset(this.createPeptides, this.createName, this.createSave);
        }
    }
}
</script>

<style lang="less" scoped>
</style>
