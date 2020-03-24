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
import DataSourceItem from "@/components/heatmap/DataSourceItem";

@Component({
    computed: {
        headers: {
            get() {
                return [
                    {
                        text: "Name",
                        align: "left",
                        value: "name",
                        width: "40%"
                    },
                    {
                        text: this.identifierInsteadOfCategory ? "Identifier" : this.categoryTitle,
                        align: "left",
                        value: this.identifierInsteadOfCategory ? "id" : "category",
                        width: "40%"
                    },
                    {
                        text: "# Peptides",
                        align: "left",
                        value: "count",
                        width: "20%"
                    }
                ];
            }
        }
    }
})
export default class DataSource extends Vue {
    @Prop({ required: true })
    private items: DataSourceItem[];
    @Prop({ required: true })
    private categories: string[];
    @Prop({ required: false, default: false })
    private loading: boolean;
    /**
     * Show every items identifier in the table instead of the category it belongs to?
     */
    @Prop({ required: false, default: true })
    private identifierInsteadOfCategory: boolean;
    /**
     * Override category title in the table?
     */
    @Prop({ required: false, default: "Category" })
    private categoryTitle: string;

    private availableCategories: string[] = ["All"].concat(this.categories);
    private selectedCategory: string = this.availableCategories[0];

    private visibleItems: DataSourceItem[] = [];
    private selectedItems: DataSourceItem[] = [];

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
