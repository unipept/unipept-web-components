<template>
    <div>
        <v-data-table
            v-model="selectedItems"
            :headers="headers"
            :items="items"
            show-select
            item-key="code"
            :itemsPerPage="5"
            sort-by="popularity"
            :sort-desc="true"
            :loading="loading">
            <template v-slot:items="props">
                <tr :active="props.selected" @click="props.selected = !props.selected">
                    <td>
                        <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>
                    </td>
                    <td>{{ props.item.name }}</td>
                    <td>{{ props.item.code }}</td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import EcDataSource from "../../logic/data-source/EcDataSource";
import { EcNameSpace, convertStringToEcNameSpace } from "../../logic/functional-annotations/EcNameSpace";
import ECAnnotation from "../../logic/functional-annotations/ECAnnotation";
import DataSourceMixin from "./DataSourceMixin.vue";
import Assay from "../../logic/data-management/assay/Assay";
import ECDefinition from "../../logic/data-management/ontology/ec/ECDefinition";

@Component
export default class EcDataSourceComponent extends mixins(DataSourceMixin) {
    @Prop({ required: true })
    private namespace: string;
    @Prop({ required: true })
    private assaysInComparison: Assay[];

    private items: ECDefinition[] = [];
    private selectedItems: ECDefinition[] = [];

    private loading: boolean = true;

    private mounted() {
        this.onNamespaceChanged();
    }

    @Watch("namespace")
    private async onNamespaceChanged() {
        this.loading = true;

        // Reset lists without changing the list-object reference.
        this.items.length = 0;
        this.selectedItems.length = 0;

        this.items.push(...await this.computeUniqueEcNumbers());

        this.loading = false;
    }

    @Watch("selectedItems", { deep: true })
    private async onSelectedItemsChanged() {
        this.$emit("selected-items", this.selectedItems);
    }

    private async computeUniqueEcNumbers(): Promise<Set<ECDefinition>> {
        const items: Set<ECDefinition> = new Set();
        for (const assay of this.assaysInComparison) {
            const ecSource: EcDataSource = await assay.dataRepository.createEcDataSource();
            const ecAnnotations: ECAnnotation[] = await ecSource.getEcNumbers(
                convertStringToEcNameSpace(this.namespace)
            );
            for (const def of ecAnnotations.map(a => a.definition)) {
                items.add(def);
            }
        }
        return items;
    }
}
</script>

<style scoped>
</style>
