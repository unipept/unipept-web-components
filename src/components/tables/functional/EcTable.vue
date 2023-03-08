<template>
    <div>
        <v-data-table
            :headers="headers"
            :loading="loading"
            :items="items"
            :sortBy="['count']"
            :sortDesc="[true]"
            :itemsPerPage="5"
            item-key="code"
            :expanded.sync="expanded"
            show-expand
        >
            <template v-slot:header.action>
                <Tooltip message="Download table as CSV">
                    <v-icon @click="downloadCsv(items)">mdi-download</v-icon>
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

            <template v-slot:item.action="{ item }">
                <Tooltip
                    v-if="downloadItem"
                    message="Download CSV summary of the filtered functional annotation">
                    <v-btn icon @click="downloadEcItem(item.code)">
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

import EcTableItem from './EcTableItem';
import useCsvDownload from '@/composables/useCsvDownload';
import { EcCode, FunctionalCode, GoCode, HighlightedTreeProcessor, NcbiId, NcbiTree, Peptide } from '@/logic';
import Tooltip from '@/components/util/Tooltip.vue';
import { ref } from 'vue';
import { VDataTable, VIcon, VBtn } from 'vuetify/lib';
import { DataNodeLike } from 'unipept-visualizations/types';
import VisualizationControls from '@/components/visualizations/VisualizationControls.vue';
import TreeView from '@/components/visualizations/TreeView.vue';

export interface Props {
    items: EcTableItem[],

    loading: boolean
    showPercentage: boolean,
    ncbiTree?: NcbiTree
    taxaToPeptides?: Map<NcbiId, Peptide[]>
    itemToPeptides?: Map<EcCode, Peptide[]>
    downloadItem?: (code: FunctionalCode) => Promise<void>
}

const props = defineProps<Props>();

const expanded = ref<EcTableItem[]>([]);

const treeAvailable = new Map<string, DataNodeLike>();

const highlightedTreeProcessor = new HighlightedTreeProcessor();

const computingTree = ref(false);

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

const highlightColor: string = "#ffc107";
const highlightColorFunc = (d: any) => d.extra.included ? highlightColor : "lightgrey";
const linkStrokeColor = ({ target: d }: any) => highlightColorFunc(d.data);

const url = (code: string) => {
    return `https://www.uniprot.org/uniprot/?query=${code}`;
}

const { download } = useCsvDownload();

const downloadCsv = (items: EcTableItem[]) => {
    const header = ["Peptides", "EC-number", "Name"];
    const grid: string[][] = items.map(item => [item.count.toString(), item.code, item.name]);

    download(header, grid, "ec-table.csv");
}

const downloadEcItem = async (code: FunctionalCode) => {
    if(props.downloadItem) {
        await props.downloadItem(code);
    }
}

const onExpandClicked = (item: EcTableItem) => {
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
