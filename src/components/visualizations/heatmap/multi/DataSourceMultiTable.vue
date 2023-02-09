<template>
    <div>
        <v-select :items="categories" v-model="selectedCategory" label="Category"></v-select>

        <div class="table-extra-content" v-if="selectedItems.length > 0">
            You selected {{ selectedItems.length }} out of {{ items.length }} items.
            <a @click="selectAll" v-if="selectedItems.length !== items.length">Select all?</a>
            <a @click="deselectAll" v-else>Deselect all?</a>
        </div>

        <v-data-table
            v-model="selectedItems"
            :headers="headers"
            :items="items"
            :loading="loading"
            :search="selectedCategory"
            :custom-filter="categoryFilter"
            
            show-select
            :itemsPerPage="5"
        >

        </v-data-table>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DataSourceMultiItem from './DataSourceMultiItem';

export interface Props {
    items: DataSourceMultiItem[]
    categories: string[]
    loading: boolean
    identifier?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    identifier: false
});

const emits = defineEmits(['select']);

const headers = computed(() => [
    {
        text: "Name",
        align: "start",
        value: "name",
        width: "30%"
    },,
    {
        text: props.identifier ? "Identifier" : "Rank",
        align: "start",
        value: props.identifier ? "id" : "category",
        width: "30%"
    },
    {
        text: "# Peptides",
        align: "start",
        value: "count",
        width: "20%"
    },
    {
        text: "# Assays",
        align: "start",
        value: "assayCount",
        width: "20%"
    },
]);

const selectedCategory = ref<string>("All");
const selectedItems = ref<any[]>([]);

const selectAll = () => {
    selectedItems.value = props.items;
};

const deselectAll = () => {
    selectedItems.value.splice(0, selectedItems.value.length);
};

const categoryFilter = (value: any, category: string, item: any) => {
    if (category === "All") {
        return true;
    }

    return item.category === category;
}

watch(() => props.items, () => deselectAll());

watch(selectedItems, (selected) => {
    emits('select', selected);
});
</script>