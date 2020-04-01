<docs>
    This component is designed to display information about taxonomic or functional annotations for multiple assays.
    Both the total number of peptides (over multiple assays) that are annotated with a specific annotation and the
    amount of assays in which the annotation occurs are shown (as well as the annotation's name and category or id).
</docs>

<template>
    <data-source
        :items="items"
        :categories="categories"
        :headers="headers"
        :loading="loading">
    </data-source>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import DataSource from "./DataSource.vue";
import { Prop } from "vue-property-decorator";
import MultiAssayDataSourceItem from "./MultiAssayDataSourceItem";

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
                        width: "30%"
                    },
                    {
                        text: this.identifierInsteadOfCategory ? "Identifier" : this.categoryTitle,
                        align: "left",
                        value: this.identifierInsteadOfCategory ? "id" : "category",
                        width: "30%"
                    },
                    {
                        text: "# Peptides",
                        align: "left",
                        value: "count",
                        width: "20%"
                    },
                    {
                        text: "# Assays",
                        align: "left",
                        value: "assayCount",
                        width: "20%"
                    }
                ];
            }
        }
    }
})
export default class MultiAssayDataSource extends Vue {
    @Prop({ required: true })
    private items: MultiAssayDataSourceItem[];
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
}
</script>

<style scoped>

</style>
