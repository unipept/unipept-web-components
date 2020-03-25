 <docs>
The `LoadLocalDatasetCard` displays a list of all assays that are persistently stored on the user's local computer. The
component provides him with the option to select one of these assays for analysis.
</docs>

<template>
    <v-card flat>
        <v-card-text v-if="storedAssays.length === 0">
            <span id="empty-dataset-placeholder">
                There are currently no datasets present in your browser's local storage.
            </span>
        </v-card-text>
        <v-list two-line class="stored-assays-list">
            <template v-for="dataset of storedAssays">
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
                            {{ dataset.getDate().toLocaleDateString() }}
                        </v-list-item-action-text>
                        <tooltip message="Delete this sample from local storage.">
                            <v-btn class="remove-assay-button" icon text @click="removeAssay(dataset)" v-on:click.stop>
                                <v-icon color="grey darken-1">mdi-close</v-icon>
                            </v-btn>
                        </tooltip>
                    </v-list-item-action>
                </v-list-item>
            </template>
        </v-list>

        <v-dialog class="remove-confirmation-dialog" v-model="confirmationDialog" max-width="400">
            <v-card>
                <v-card-title class="headline">Confirm sample deletion?</v-card-title>

                <v-card-text>
                    Are you sure you want to permanently delete "{{ deletionName }}" from your browser?
                    This operation cannot be undone.
                </v-card-text>

                <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn class="confirmation-cancel-button" color="black" text @click="confirmationDialog = false">
                    Cancel
                </v-btn>

                <v-btn
                    class="confirmation-ok-button"
                    color="primary"
                    text
                    @click="confirmAssayDeletion(markedForDeletion)">
                    OK
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component"
import { Prop, Watch } from "vue-property-decorator";
import Tooltip from "../custom/Tooltip.vue";
import DatasetMixin from "./DatasetMixin.vue";
import Assay from "./../../business/entities/assay/Assay";

@Component({
    components: {
        Tooltip
    },
    computed: {
        deletionName: {
            get() {
                if (this.markedForDeletion != null) {
                    return this.markedForDeletion.getName();
                } else {
                    return "";
                }
            }
        }
    }
})
export default class LoadLocalDatasetCard extends mixins(DatasetMixin) {
    /**
     * All datasets that are stored in persistent storage (and have already been loaded into memory). The user is able
     * to chose each any one of these items and start an analysis.
     */
    @Prop({ required: true })
    private storedAssays: Assay[];

    private confirmationDialog: boolean = false;
    private markedForDeletion: Assay = null;

    private removeAssay(assay: Assay) {
        this.markedForDeletion = assay;
        this.confirmationDialog = true;
    }

    private confirmAssayDeletion(assay: Assay) {
        this.deleteDataset(assay);
        this.confirmationDialog = false;
    }

    @Watch("confirmationDialog")
    private onConfirmationClosed() {
        if (!this.confirmationDialog) {
            this.markedForDeletion = null;
        }
    }
}
</script>

<style lang="less" scoped>
</style>
