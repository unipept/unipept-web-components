<template>
    <div>
        <v-select :items="availableCategories" v-model="selectedCategory" label="Category"></v-select>
        <v-data-table
            v-model="selectedItems"
            :headers="headers"
            :items="visibleItems"
            show-select
            item-key="id"
            :itemsPerPage="5"
            sort-by="popularity"
            sort-desc
            :loading="loading">
            <template v-slot:header.data-table-select="{ on, props }">
                <v-simple-checkbox color="primary" v-bind="props" v-on="on"></v-simple-checkbox>
            </template>
            <template v-slot:item.data-table-select="{ isSelected, select }">
                <v-simple-checkbox color="primary" :value="isSelected" @input="select($event)"></v-simple-checkbox>
            </template>
            <template v-slot:items="props">
                <tr :active="props.selected" @click="props.selected = !props.selected">
                    <td>
                        <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>
                    </td>
                    <td>{{ props.item.name }}</td>
                    <td>{{ props.item.id }}</td>
                    <td class="text-xs-right">{{ props.item.count }}</td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import SingleAssayDataSourceItem from "./SingleAssayDataSourceItem";

@Component
export default class DataSource extends Vue {
    @Prop({ required: true })
    private items: any[];
    @Prop({ required: true })
    private categories: string[];
    @Prop({ required: true })
    private headers: any[];
    @Prop({ required: false, default: false })
    private loading: boolean;

    private availableCategories: string[] = ["All"].concat(this.categories);
    private selectedCategory: string = this.availableCategories[0];

    private visibleItems: any[] = [];
    private selectedItems: any[] = [];

    mounted() {
        this.onInputsChanged();
    }

    @Watch("categories")
    private onCategoriesChanged() {
        this.availableCategories = ["All"].concat(this.categories)
        this.selectedCategory = this.availableCategories[0];
    }

    @Watch("selectedCategory")
    @Watch("items")
    private onInputsChanged() {
        this.visibleItems.length = 0;
        if (this.items) {
            if (this.selectedCategory === "All") {
                this.visibleItems.push(...this.items);
            } else {
                this.visibleItems.push(...this.items.filter(i => i.category === this.selectedCategory));
            }
        }
    }

    @Watch("items")
    private onItemsChanged() {
        this.selectedItems.length = 0;
    }

    @Watch("selectedItems")
    private onSelectedItemsChanged() {
        /**
         * This event is emitted whenever the currently selected list of items has been updated by the user.
         */
        this.$emit("selected-items", this.selectedItems);
    }
}
</script>

<style scoped>

</style>