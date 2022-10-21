<template>
    <div>
        <v-data-table
            :headers="headers"
            :loading="loading"
            :items="items"
            :sortBy="['count']"
            :sortDesc="[true]"
            :itemsPerPage="5"
        >
            <template v-slot:header.action>
                <Tooltip message="Download table as CSV">
                    <v-icon @click="downloadCsv(items)">mdi-download</v-icon>
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
                <a :href="url(item.code)" target="_blank" class="font-regular d-flex">
                    {{ item.code }}
                    <v-icon class="pl-2" x-small>mdi-open-in-new</v-icon>
                </a>
            </template>
            <template v-slot:item.name="{ item }">
                <span style="text-overflow: ellipsis;">
                     {{ item.name }}
                </span>
            </template>
        </v-data-table>
    </div>
</template>

<script setup lang="ts">
import EcTableItem from './EcTableItem';
import Tooltip from '@/components/util/Tooltip.vue';
import useCsvDownload from '@/composables/useCsvDownload';

export interface Props {
    items: EcTableItem[],

    loading: boolean
    showPercentage: boolean
}

const props = defineProps<Props>();

const headers = [
    {
        text: "Peptides",
        align: "start",
        value: "count",
        width: "20%"
    },
    {
        text: "EC-number",
        align: "start",
        value: "code",
        width: "30%"
    },
    {
        text: "Name",
        align: "start",
        value: "name",
        width: "45%"
    },
    {
        text: "",
        align: "center",
        value: "action",
        width: "5%",
        sortable: false
    }
];

const url = (code: string) => {
    return `https://www.uniprot.org/uniprot/?query=${code}`;
}

const { download } = useCsvDownload();

const downloadCsv = (items: EcTableItem[]) => {
    const header = ["Peptides", "EC-number", "Name"];
    const grid: string[][] = items.map(item => [item.count.toString(), item.code, item.name]);

    download(header, grid, "ec-table.csv");
}
</script>

<style scoped>
    a {
        text-decoration: none;
    }

    a:hover {
        text-decoration: none;
    }
</style>
