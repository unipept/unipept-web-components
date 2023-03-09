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
            item-key="code"
            :expanded.sync="expanded"
            show-expand
        >
            <template v-slot:header.action>
                <Tooltip message="Download table as CSV">
                    <v-icon @click="downloadCsv(items, selectedNamespace)">mdi-download</v-icon>
                </Tooltip>
            </template>

            <template v-slot:item.data-table-expand="{ item }">
                <v-btn v-if="ncbiTree" class="v-data-table__expand-icon" icon :disabled="item.totalAnnotations === 0" @click="onExpandClicked(item)">
                    <v-icon v-if="expanded.findIndex(i => i.code === item.code) !== -1">mdi-chevron-up</v-icon>
                    <v-icon v-else>mdi-chevron-down</v-icon>
                </v-btn>
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

            <template v-slot:item.action="{ item }">
                <Tooltip
                    v-if="downloadItem"
                    message="Download CSV summary of the filtered functional annotation">
                    <v-btn icon @click="downloadInterproItem(item.code)">
                        <v-icon>
                            mdi-download
                        </v-icon>
                    </v-btn>
                </tooltip>
            </template>

            <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length" class="expand-container">
                    <VisualizationControls
                        ref="treeview"
                        caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
                        internalDownload
                        :loading="!ncbiTree"
                    >
                        <template #visualization>
                            <TreeView 
                                :data="treeAvailable.get(item.code)"
                                :loading="computingTree && !treeAvailable.get(item.code)"
                                :autoResize="true"
                                :height="350"
                                :linkStrokeColor="linkStrokeColor"
                                :nodeStrokeColor="highlightColorFunc"
                                :nodeFillColor="highlightColorFunc"
                            />
                        </template>
                    </VisualizationControls>
                </td>
            </template>
        </v-data-table>
    </div>
</template>

<script setup lang="ts">
// @ts-nocheck

import { FunctionalCode, HighlightedTreeProcessor, InterproCode, InterproNamespace, NcbiId, NcbiTree, Peptide } from '@/logic';
import { ref } from 'vue';
import InterproTableItem from './InterproTableItem';
import Tooltip from '@/components/util/Tooltip.vue';
import useCsvDownload from '@/composables/useCsvDownload';
import VisualizationControls from '@/components/visualizations/VisualizationControls.vue';
import TreeView from '@/components/visualizations/TreeView.vue';
import { DataNodeLike } from 'unipept-visualizations/types';
import { VSelect, VDataTable, VIcon, VBtn } from 'vuetify/lib';

export interface Props {
    items: InterproTableItem[],

    loading: boolean,
    showPercentage: boolean,
    ncbiTree?: NcbiTree
    taxaToPeptides?: Map<NcbiId, Peptide[]>
    itemToPeptides?: Map<InterproCode, Peptide[]>
    downloadItem?: (code: FunctionalCode) => Promise<void>
}

const props = defineProps<Props>();

const expanded = ref<InterproTableItem[]>([]);

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

const treeAvailable = new Map<string, DataNodeLike>();

const highlightedTreeProcessor = new HighlightedTreeProcessor();

const computingTree = ref(false);

const highlightColor: string = "#ffc107";
const highlightColorFunc = (d: any) => d.extra.included ? highlightColor : "lightgrey";
const linkStrokeColor = ({ target: d }: any) => highlightColorFunc(d.data);

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

const downloadInterproItem = async (code: FunctionalCode) => {
    if(props.downloadItem) {
        await props.downloadItem(code);
    }
}

const onExpandClicked = (item: InterproTableItem) => {
    computingTree.value = true;

    const idx: number = expanded.value.findIndex(i => i.code === item.code);

    computeTree(item.code);

    if (idx >= 0) {
        expanded.value.splice(idx, 1);
    } else {
        expanded.value.push(item);
    }
}

const computeTree = (code: string) => {
    if (props.taxaToPeptides) {
        highlightedTreeProcessor.computeHighlightedTree(
            props.itemToPeptides?.get(code) ?? [],
            props.ncbiTree,
            props.taxaToPeptides
        ).then((rootNode: any) => {
            treeAvailable.set(code, rootNode);
            computingTree.value = false;
        });
    }
}
</script>

<style scoped>
.expand-container {
    padding: 0 !important;
    border-style: none solid solid solid;
    border-color: #ededed;
}

a {
    text-decoration: none;
}

a:hover {
    text-decoration: none;
}
</style>
