<docs>
The `LoadLocalDatasetCard` displays a list of all assays that are persistently stored on the user's local computer. The 
component provides him with the option to select one of these assays for analysis.
</docs>

<template>
    <v-card flat>
        <v-card-text v-if="storedAssays.length === 0">
            <span>There are currently no datasets present in your browser's local storage.</span>
        </v-card-text>
        <v-list two-line>
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
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component"
import Assay from "../../logic/data-management/assay/Assay";
import { Prop } from "vue-property-decorator";
import Tooltip from "../custom/Tooltip.vue";
import DatasetMixin from "./DatasetMixin.vue";

@Component({
    components: {
        Tooltip
    }
})
export default class LoadLocalDatasetCard extends mixins(DatasetMixin) {
    /**
     * All datasets that are stored in persistent storage (and have already been loaded into memory). The user is able 
     * to chose each any one of these items and start an analysis.
     */
    @Prop({ required: true })
    private storedAssays: Assay[];
}
</script>

<style lang="less" scoped>
</style>
