<docs>
    This component represents a table that displays all metadata about a certain functional or taxonomical annotation.
    The table consists out of 3 different columns that respectively display the name, the identifier (or category)
    and the amount of associated peptides of an annotation.
</docs>

<template>
    <data-source
        :items="items"
        :categories="categories"
        :headers="headers"
        :loading="loading"
        v-on:selected-items="onSelectedItems">
    </data-source>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import DataSource from "./DataSource.vue";
import { Prop } from "vue-property-decorator";
import SingleAssayDataSourceItem from "./SingleAssayDataSourceItem";

@Component({
    components: {
        DataSource
    },
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
export default class SingleAssayDataSource extends Vue {
    @Prop({ required: true })
    private items: SingleAssayDataSourceItem[];
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

    private onSelectedItems(items) {
        this.$emit("selected-items", items);
    }
}
</script>

<style scoped>

</style>
