<template>
    <div>
        <v-select :items="selectableCategories" v-model="selectedCategory" label="Category"></v-select>

        <div class="table-extra-content" v-if="selectedItems.length > 0">
            You selected {{ selectedItems.length }} out of {{ items.length }} items.
            <a @click="selectAll" v-if="selectedItems.length !== items.length">Select all?</a>
            <a @click="deselectAll" v-else>Deselect all?</a>
        </div>

        <v-data-table
            v-model="selectedItems"
            :headers="headers"
            :items="items"
            show-select
            item-key="id"
            :itemsPerPage="5"
            sort-by="popularity"
            sort-desc
            :loading="loading"
            :search="selectedCategory"
            :custom-filter="categoryFilter"
        >

        </v-data-table>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

export interface Props {
    items: any[]
    categories: string[]
    headers: any[]
    loading: boolean
}

const props = defineProps<Props>();

const emits = defineEmits(['select']);

const selectableCategories = computed(() => {
    return ["All"].concat(props.categories);
})

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

watch(selectedItems, (selected) => {
    emits('select', selected);
});
</script>