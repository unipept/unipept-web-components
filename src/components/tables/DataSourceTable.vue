<template>
    <div>
        <v-select
            v-model="selectedCategory"
            :items="categories"
            label="Category"
        />

        <div
            v-if="selectedItems.length > 0"
            class="table-extra-content"
        >
            You selected {{ selectedItems.length }} out of {{ items.length }} items.
            <a
                v-if="selectedItems.length !== items.length"
                @click="selectAll"
            >
                Select all?
            </a>
            <a
                v-else
                @click="deselectAll"
            >
                Deselect all?
            </a>
        </div>

        <v-data-table
            v-model="selectedItems"
            :headers="headers"
            :items="items"
            :loading="loading"
            :search="selectedCategory"
            :custom-filter="categoryFilter"
            :items-per-page="5"
            return-object
            color="primary"
            show-select
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import DataSourceItem from '@/components/tables/DataSourceItem';
import { VDataTable } from 'vuetify/labs/VDataTable';

export interface Props {
    items: DataSourceItem[]
    categories: string[]
    loading: boolean
    identifier?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    identifier: false
});

const emits = defineEmits(['select']);

const headers = ref([
    {
        title: "Name",
        align: "start",
        key: "name",
        width: "40%"
    },
    {
        title: props.identifier ? "Identifier" : "Rank",
        align: "start",
        key: props.identifier ? "id" : "category",
        width: "40%"
    },
    {
        title: "# Peptides",
        align: "start",
        key: "count",
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
