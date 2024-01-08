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

        <!-- @vue-ignore (TODO: types should work once data tables are not in labs anymore) -->
        <v-data-table
            v-model="selectedItems"
            :headers="headers"
            :items="items"
            :loading="loading"
            :search="selectedCategory"
            :custom-filter="categoryFilter"
            show-select
            :items-per-page="5"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
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

const headers = ref([
    {
        title: "Name",
        align: "start",
        key: "name",
        width: "30%"
    },
    {
        title: props.identifier ? "Identifier" : "Rank",
        align: "start",
        key: props.identifier ? "id" : "category",
        width: "30%"
    },
    {
        title: "# Peptides",
        align: "start",
        key: "count",
        width: "20%"
    },
    {
        title: "# Assays",
        align: "start",
        key: "assayCount",
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
