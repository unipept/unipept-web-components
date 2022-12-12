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

            <template v-slot:item.action="{ item }">
                <Tooltip
                    v-if="downloadItem"
                    message="Download CSV summary of the filtered functional annotation">
                    <v-btn icon @click="downloadGoItem(item.code)">
                        <v-icon>
                            mdi-download
                        </v-icon>
                    </v-btn>
                </tooltip>
            </template>
        </v-data-table>
    </div>
</template>

<script setup lang="ts">
import GoTableItem from './GoTableItem';
import Tooltip from '@/components/util/Tooltip.vue';
import useCsvDownload from '@/composables/useCsvDownload';
import { FunctionalCode } from '@/logic';

export interface Props {
    items: GoTableItem[],

    loading: boolean
    showPercentage: boolean,
    downloadItem?: (code: FunctionalCode) => Promise<void>
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
        text: "GO-term",
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
    return `http://amigo.geneontology.org/amigo/search/ontology?q=${code}`;
}

const { download } = useCsvDownload();

const downloadCsv = (items: GoTableItem[]) => {
    const header = ["Peptides", "GO-term", "Name", "Namespace"];
    const grid: string[][] = items.map(item => [item.count.toString(), item.code, item.name, item.namespace]);

    const namespace: string = items[0].namespace;

    download(header, grid, `go-${namespace.split(" ").join("_")}-table.csv`);
}

const downloadGoItem = async (code: FunctionalCode) => {
    if(props.downloadItem) {
        await props.downloadItem(code);
    }
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
