<template>
    <v-data-table
            v-model="selectedItems"
            :headers="headers"
            :items="items"
            show-select
            item-key="identifier"
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
                <td class="text-xs-right">{{ props.item.popularity }}</td>
            </tr>
        </template>
    </v-data-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import Assay from "@/logic/data-management/assay/Assay";

@Component
export default class ComparativeDataSourceComponent extends Vue {
    @Prop({ required: true })
    private items: Comparative[];
    @Prop({ required: true })
    private identifierName: string;
    @Prop({ required: false, default: false })
    private loading: boolean;

    private selectedItems: Comparative[] = [];

    private assaysInComparison: Assay[] = []

    protected headers = [
        {
            text: "Name",
            align: "left",
            value: "name",
            width: "40%"
        },
        {
            text: this.identifierName,
            align: "left",
            value: "identifier",
            width: "40%"
        },

        {
            text: "# peptides",
            align: "left",
            value: "popularity",
            width: "40%"
        }
    ];

    @Watch("selectedItems", { deep: true })
    async onSelectedItemsChanged() {
        this.$emit("selected-items", this.selectedItems);
    }
}
</script>

<style scoped>

</style>
