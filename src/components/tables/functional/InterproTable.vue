<template>
    <div>
        <v-select :items="namespaceValues" label="Category" v-model="selectedNamespace"></v-select>
        <v-data-table
            :headers="headers"
            :loading="loading"
            :items="items"
            :search="selectedNamespace"
            :customFilter="filterNamespace"
            :sortBy="['count']"
            :sortDesc="[true]"
        >
            <template v-slot:header.action>
                <Tooltip message="Download table as CSV">
                    <v-icon @click="downloadCsv(items, selectedNamespace)">mdi-download</v-icon>
                </Tooltip>
            </template>

            <template v-slot:item.count="{ item }">
                <div :style="{
                        padding: '12px',
                        background: 'linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ' +
                            item.relativeCount * 100 + '%, rgba(255,255,255,0) ' + item.relativeCount * 100 + '%)',
                    }">
                    {{ showPercentage ? (item.relativeCount * 100).toFixed(2) + " %" : item.count }}
                </div>
            </template>
            <template v-slot:item.code="{ item }">
                <a :href="url(item.code)" target="_blank" class="font-regular">
                    {{ item.code }}
                    <v-icon x-small>mdi-open-in-new</v-icon>
                </a>
            </template>
            <template v-slot:item.name="{ item }">
                <span style="text-overflow: ellipsis;">
                     {{ item.name }}
                </span>
            </template>
            <template v-slot:item.namespace="{ item }">
                <span style="text-overflow: ellipsis;">
                     {{ item.namespace }}
                </span>
            </template>
        </v-data-table>
    </div>
</template>

<script setup lang="ts">
import { InterproNamespace } from '@/logic';
import { ref } from 'vue';
import InterproTableItem from './InterproTableItem';
import Tooltip from '@/components/util/Tooltip.vue';
import useCsvDownload from '@/composables/useCsvDownload';

export interface Props {
    items: InterproTableItem[],

    loading: boolean
    showPercentage: boolean
}

defineProps<Props>();

const headers = [
    {
        text: "Peptides",
        align: "start",
        value: "count",
        width: "20%"
    },
    {
        text: "InterPro-entry",
        align: "start",
        value: "code",
        width: "20%"
    },
    {
        text: "Name",
        align: "start",
        value: "name",
        width: "45%"
    },
    {
        text: "Namespace",
        align: "start",
        value: "namespace",
        width: "30%"
    },
    {
        text: "",
        align: "center",
        value: "action",
        width: "5%",
        sortable: false
    }
];

const namespaceValues: string[] = ["all"].concat(Object.values(InterproNamespace).map(i => i.toString())).sort();

const selectedNamespace = ref<string>("all");

const filterNamespace = (count: number, search: string, item: InterproTableItem) => {
    if(search === "all") {
        return true;
    }

    return item.namespace === search;
}

const url = (code: string) => {
    return `https://www.ebi.ac.uk/interpro/search/text/${code.substring(4)}/#table`;
}

const { download } = useCsvDownload();

const downloadCsv = (items: InterproTableItem[], namespace: string) => {
    const header = ["Peptides", "InterPro-entry", "Name", "Namespace"];

    const grid: string[][] = items
        .filter(item => namespace === "all" || item.namespace === namespace)
        .map(item => [item.count.toString(), item.code, item.name, item.namespace]);

    download(header, grid, `interpro-${namespace.split(" ").join("_")}-table.csv`);
}
</script>
