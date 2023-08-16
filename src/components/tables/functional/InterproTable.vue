<template>
    <div>
        <v-select
            v-model="selectedNamespace"
            :items="namespaceValues"
            label="Category"
        />

        <v-data-table
            v-model:expanded="expanded"
            :headers="headers"
            :loading="loading"
            :items="items"
            :search="selectedNamespace"
            :custom-filter="filterNamespace"
            :sort-by="['count']"
            :sort-desc="[true]"
            item-key="code"
            show-expand
        >
            <template #header.action>
                <v-tooltip text="Download table as CSV">
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            icon="mdi-download"
                            @click="downloadCsv(items, selectedNamespace)"
                        />
                    </template>
                </v-tooltip>
            </template>

<!--            <template #item.data-table-expand="{ item }">-->
<!--                <v-btn -->
<!--                    v-if="ncbiTree" -->
<!--                    class="v-data-table__expand-icon" -->
<!--                    icon="" :disabled="item.totalAnnotations === 0" @click="onExpandClicked(item)">-->
<!--                    <v-icon v-if="expanded.findIndex(i => i.code === item.code) !== -1">mdi-chevron-up</v-icon>-->
<!--                    <v-icon v-else>mdi-chevron-down</v-icon>-->
<!--                </v-btn>-->
<!--            </template>-->

            <template #item.count="{ item }">
                <div
                    :style="{
                        padding: '12px',
                        background: 'linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ' +
                            item.selectable.relativeCount * 100 + '%, rgba(255,255,255,0) ' + item.selectable.relativeCount * 100 + '%)',
                    }"
                >
                    {{ showPercentage ? (item.selectable.relativeCount * 100).toFixed(2) + " %" : item.selectable.count }}
                </div>
            </template>

            <template #item.code="{ item }">
                <a
                    :href="url(item.selectable.code)"
                    target="_blank"
                    class="font-regular"
                >
                    {{ item.selectable.code }}
                    <v-icon x-small>mdi-open-in-new</v-icon>
                </a>
            </template>

            <template #item.name="{ item }">
                <span style="text-overflow: ellipsis;">
                    {{ item.selectable.name }}
                </span>
            </template>

            <template #item.namespace="{ item }">
                <span style="text-overflow: ellipsis;">
                    {{ item.selectable.namespace }}
                </span>
            </template>

            <template #item.action="{ item }">
                <v-tooltip
                    v-if="downloadItem"
                    text="Download CSV summary of the filtered functional annotation"
                >
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            icon="mdi-download"
                            variant="plain"
                            @click="downloadInterproItem(item.selectable.code)"
                        />
                    </template>
                </v-tooltip>
            </template>

            <template #expanded-row="{ columns, item }">
                <td
                    :colspan="columns.length"
                    class="expand-container"
                >
                    <VisualizationControls
                        ref="treeview"
                        caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
                        internal-download
                        :loading="!ncbiTree"
                    >
                        <template #visualization>
                            <TreeView
                                :data="treeAvailable.get(item.code)"
                                :loading="computingTree && !treeAvailable.get(item.code)"
                                :auto-resize="true"
                                :height="350"
                                :link-stroke-color="linkStrokeColor"
                                :node-stroke-color="highlightColorFunc"
                                :node-fill-color="highlightColorFunc"
                            />
                        </template>
                    </VisualizationControls>
                </td>
            </template>
        </v-data-table>
    </div>
</template>

<script setup lang="ts">
import { FunctionalCode, HighlightedTreeProcessor, InterproCode, InterproNamespace, NcbiId, NcbiTree, Peptide } from '@/logic';
import { ref } from 'vue';
import InterproTableItem from './InterproTableItem';
import useCsvDownload from '@/composables/useCsvDownload';
import VisualizationControls from '@/components/visualizations/VisualizationControls.vue';
import TreeView from '@/components/visualizations/TreeView.vue';
import { DataNodeLike } from 'unipept-visualizations/types';
import { VDataTable } from 'vuetify/labs/VDataTable';

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

const headers = ref([
    {
        title: "Peptides",
        align: "start",
        key: "count",
        width: "20%"
    },
    {
        title: "InterPro-entry",
        align: "start",
        key: "code",
        width: "20%"
    },
    {
        title: "Name",
        align: "start",
        key: "name",
        width: "45%"
    },
    {
        title: "Namespace",
        align: "start",
        key: "namespace",
        width: "30%"
    },
    {
        title: "",
        align: "center",
        key: "action",
        width: "5%",
        sortable: false
    }
]);

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

// const onExpandClicked = (item: InterproTableItem) => {
//     computingTree.value = true;
//
//     const idx: number = expanded.value.findIndex(i => i.code === item.code);
//
//     computeTree(item.code);
//
//     if (idx >= 0) {
//         expanded.value.splice(idx, 1);
//     } else {
//         expanded.value.push(item);
//     }
// }

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
