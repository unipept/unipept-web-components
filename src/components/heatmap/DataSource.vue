<template>
    <div>
        <v-select :items="availableCategories" v-model="selectedCategory" label="Category"></v-select>
        <div class="table-extra-content" v-if="selectedItems.length > 0">
            You selected {{ selectedItems.length }} out of {{ visibleItems.length }} items.
            <a @click="selectAll" v-if="selectedItems.length !== visibleItems.length">Select all?</a>
            <a @click="deselectAll" v-else>Deselect all?</a>
        </div>
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

    private selectAll() {
        this.selectedItems.length = 0;
        this.selectedItems.push(...this.visibleItems);
    }

    private deselectAll() {
        this.selectedItems.splice(0, this.selectedItems.length);
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
        this.selectedItems.splice(0, this.selectedItems.length);
        if (this.items) {
            if (this.selectedCategory === "All") {
                this.visibleItems.push(...this.items);
            } else {
                this.visibleItems.push(...this.items.filter(i => i.category.toLowerCase() === this.selectedCategory.toLowerCase()));
            }
        } else {
            console.log("Resetting visible items...");
            this.visibleItems.length = 0;
        }
    }

    @Watch("items")
    private onItemsChanged() {
        this.selectedItems.splice(0, this.selectedItems.length);
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
