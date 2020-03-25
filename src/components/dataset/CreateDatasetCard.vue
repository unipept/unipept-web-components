<docs>
The CreateDatasetCard provides the user with a form for creating a new Assay, based on a list of peptides. The user
can indicate it's preference to storing this card in persistent storage. Note that this component does not store or
select assays by itself, it only emits an event with it's intended action.
</docs>

<template>
    <v-card flat>
        <v-card-text>
            <dataset-form ref="createdDatasetForm"
                v-on:peptide-change="createPeptides = $event"
                :peptides="createPeptides"
                v-on:name-change="createName = $event"
                :name="createName"
                v-on:save-change="createSave = $event"
                :save="createSave">
            </dataset-form>
            <div class="card-actions" id="create-assay-button">
                <v-btn @click="selectCreateDataset()">
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
import DatasetForm from "./DatasetForm.vue";
import Assay from "./../../business/entities/assay/Assay";

@Component({
    components: {
        DatasetForm
    }
})
export default class CreateDatasetCard extends mixins(DatasetMixin) {
    $refs!: {
        createdDatasetForm: DatasetForm
    }

    private createPeptides: string = "";
    private createName: string = "";
    private createSave: boolean = true;

    private selectCreateDataset() {
        if (this.$refs.createdDatasetForm.isValid()) {
            const createdAssay: Assay = this.storeDataset(this.createPeptides, this.createName, this.createSave);
            this.$emit("create-assay", createdAssay, this.createSave);
        }
    }
}
</script>

<style lang="less" scoped>
</style>
