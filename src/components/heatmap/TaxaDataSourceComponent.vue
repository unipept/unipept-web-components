<template>
    <div>
<!--        <v-data-table-->
<!--            v-model="selectedItems"-->
<!--            :headers="headers"-->
<!--            :items="itemsWithId"-->
<!--            show-select-->
<!--            item-key="id"-->
<!--            :itemsPerPage="5"-->
<!--            sort-by="popularity"-->
<!--            :sort-desc="true"-->
<!--            :loading="loading">-->
<!--            <template v-slot:items="props">-->
<!--                <tr :active="props.selected" @click="props.selected = !props.selected">-->
<!--                    <td>-->
<!--                        <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>-->
<!--                    </td>-->
<!--                    <td>{{ props.item.name }}</td>-->
<!--                    <td>{{ props.item.rank }}</td>-->
<!--                    <td class="text-xs-right">{{ props.item.popularity }}</td>-->
<!--                </tr>-->
<!--            </template>-->
<!--        </v-data-table>-->
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";

import DataSourceComponent from "./data-source-component.vue";

import DataSourceMixin from "./DataSourceMixin.vue";

@Component({
    computed: {
        // itemsWithId: {
        //     get() {
        //         return this.items.map((item, index) => {
        //             item["id"] = index;
        //             return item;
        //         })
        //     }
        // }
    }
})
export default class TaxaDataSourceComponent extends mixins(DataSourceMixin) {
    // @Prop({ required: true })
    // private rank: string;
    // @Prop({ required: true })
    // private assaysInComparison: Assay[];
    //
    // private items: NCBITaxon[] = [];
    // private selectedItems: Element[] = [];
    //
    // private loading: boolean = true;
    //
    // private pagination = { "sortBy": "popularity", "descending": true, "rowsPerPage": 5 };
    //
    // mounted() {
    //     this.headers[1].text = "Rank";
    //     this.headers[1].value = "rank";
    //     this.onRankChanged();
    // }
    //
    // @Watch("rank")
    // async onRankChanged() {
    //     this.loading = true;
    //     // Reset lists without changing the list-object reference.
    //     this.items.length = 0;
    //     this.selectedItems.length = 0;
    //
    //     this.items.push(...await this.computeUniqueTaxons());
    //
    //     this.loading = false;
    // }
    //
    // private async computeUniqueTaxons(): Promise<Set<NCBITaxon>> {
    //     const items: Set<NCBITaxon> = new Set();
    //     for (const assay of this.assaysInComparison) {
    //         const taxaSource: TaxaDataSource = await assay.dataRepository.createTaxaDataSource();
    //         // TODO continue from here!
    //         // const taxaAnnotations: NCBIAnnotation[] = await taxaSource.getTopItems();
    //         // for (const def of ecAnnotations.map(a => a.definition)) {
    //         //     items.add(def);
    //         // }
    //     }
    //     return items;
    // }
}
</script>

<style scoped>
</style>
