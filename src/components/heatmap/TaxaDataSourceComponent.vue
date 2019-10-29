<template>
    <div>
        <v-select :items="taxaRanks" v-model="selectedRank" label="Rank" :item-text="item => capitalize(item)"></v-select>
        <v-data-table 
            v-model="selectedItems" 
            :headers="headers" 
            :items="items" 
            show-select
            item-key="name" 
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
                    <td>{{ props.item.rank }}</td>
                    <td class="text-xs-right">{{ props.item.popularity }}</td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import TaxaDataSource from "../../logic/data-source/TaxaDataSource";

import DataSourceComponent from "./data-source-component.vue";

import DataSourceMixin from "./DataSourceMixin.vue";
import { TaxumRank, convertStringToTaxumRank } from "../../logic/data-source/TaxumRank";
import TaxaElement from "../../logic/data-source/TaxaElement";

@Component
export default class TaxaDataSourceComponent extends mixins(DataSourceMixin) {
    private taxaRanks: string[] = ["all"].concat(Object.values(TaxumRank)).map(el => this.capitalize(el));
    private selectedRank: string = this.taxaRanks[0];
    
    private items: TaxaElement[] = [];
    private selectedItems: Element[] = [];

    private loading: boolean = true;

    private pagination = { "sortBy": "popularity", "descending": true, "rowsPerPage": 5 };

    mounted() {
        this.headers[1].text = "Rank";
        this.headers[1].value = "rank";
        this.onSelectedRankChanged();
    }

    @Watch("selectedRank")
    async onSelectedRankChanged() {
        this.loading = true;
        // Reset lists without changing the list-object reference.
        this.items.length = 0;
        this.selectedItems.length = 0;
        let rank: TaxumRank;

        let result: TaxaElement[] = await (this.dataSource as TaxaDataSource).getTopItems(30, convertStringToTaxumRank(this.selectedRank));
        this.items.push(...result);
        this.loading = false;
    }

    @Watch("selectedItems")
    async onSelectedItemsChanged(newItems: Element[], oldItems: Element[]) {
        
        this.$emit("selected-items", this.selectedItems);
    }
}
</script>

<style scoped>
</style>