<template>
    <v-card flat>
        <v-card-text>
            <div v-if="$store.getters.activeAssay === undefined">
                <span class="placeholder-text">
                    Please select at least one dataset for analysis.
                </span>
            </div>
            <div v-else>
                <slot name="analysis-header"></slot>

                <v-select :items="namespaceValues" label="Category" v-model="selectedNamespace"></v-select>

                <interpro-amount-table
                    :assay="assay"
                    :namespace="namespace"
                    :show-percentage="showPercentage">
                </interpro-amount-table>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import FunctionalSummaryMixin from "./FunctionalSummaryMixin.vue";
import InterproAmountTable from "./../../tables/InterproAmountTable.vue";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";
import {
    convertStringToInterproNamespace,
    InterproNamespace
} from "./../../../business/ontology/functional/interpro/InterproNamespace";
import ProteomicsAssay from "./../../../business/entities/assay/ProteomicsAssay";

@Component({
    components: {
        InterproAmountTable,
        FilterFunctionalAnnotationsDropdown
    }
})
export default class InterproSummaryCard extends mixins(FunctionalSummaryMixin) {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: false, default: false })
    private showPercentage: boolean;

    private namespaceValues: string[] = ["all"].concat(Object.values(InterproNamespace));
    private selectedNamespace: string = "all";

    get namespace(): InterproNamespace | null {
        if (this.selectedNamespace === "all") {
            return null;
        } else {
            return convertStringToInterproNamespace(this.selectedNamespace);
        }
    }
}
</script>

<style lang="less">
    .waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
    }
</style>
