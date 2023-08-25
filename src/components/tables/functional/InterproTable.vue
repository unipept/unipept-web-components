<template>
    <div>
        <v-select
            v-model="selectedNamespace"
            :items="namespaceValues"
            label="Category"
        />

        <!-- @vue-ignore (TODO: types should work once data tables are not in labs anymore) -->
        <v-data-table
            v-model:expanded="expanded"
            :headers="headers"
            :loading="loading"
            :items="items"
            :search="selectedNamespace"
            :custom-filter="filterNamespace"
            :sort-by="['count']"
            :sort-desc="[true]"
            item-value="code"
            show-expand
        >
            <!-- @vue-ignore (TODO: types should work once data tables are not in labs anymore) -->
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

            <template #item.data-table-expand="{ item }">
                <v-btn
                    v-if="ncbiTree"
                    size="small"
                    variant="plain"
                    :icon="expanded.findIndex(i => i === item.raw.code) !== -1 ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                    :disabled="item.raw.totalAnnotations === 0"
                    @click="onExpandClicked(item)"
                />
            </template>

            <template #item.count="{ item }">
                <div
                    :style="{
                        padding: '12px',
                        background: 'linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ' +
                            item.raw.relativeCount * 100 + '%, rgba(255,255,255,0) ' + item.raw.relativeCount * 100 + '%)',
                    }"
                >
                    {{ showPercentage ? (item.raw.relativeCount * 100).toFixed(2) + " %" : item.raw.count }}
                </div>
            </template>

            <template #item.code="{ item }">
                <a
                    :href="url(item.raw.code)"
                    target="_blank"
                    class="font-regular"
                >
                    {{ item.raw.code }}
                    <v-icon size="x-small">mdi-open-in-new</v-icon>
                </a>
            </template>

            <template #item.name="{ item }">
                <span style="text-overflow: ellipsis;">
                    {{ item.raw.name }}
                </span>
            </template>

            <template #item.namespace="{ item }">
                <span style="text-overflow: ellipsis;">
                    {{ item.raw.namespace }}
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
                            @click="downloadInterproItem(item.raw.code)"
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
                        v-if="computingTree.has(item.raw.code) && !computingTree.get(item.raw.code)"
                        ref="treeview"
                        caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
                        internal-download
                        :loading="computingTree.get(item.raw.code)!"
                    >
                        <template #visualization>
                            <TreeView
                                :data="treeAvailable.get(item.raw.code)!"
                                :loading="computingTree.get(item.raw.code)! && !treeAvailable.get(item.raw.code)"
                                :auto-resize="true"
                                :height="300"
                                :link-stroke-color="linkStrokeColor"
                                :node-stroke-color="highlightColorFunc"
                                :node-fill-color="highlightColorFunc"
                            />
                        </template>
                    </VisualizationControls>
                    <div
                        v-else
                        class="d-flex flex-column align-center pa-2"
                    >
                        <v-progress-circular
                            indeterminate
                            color="primary"
                            size="50"
                        />
                        <span>Computing highlighted tree...</span>
                    </div>
                </td>
            </template>
        </v-data-table>
    </div>
</template>

<script setup lang="ts">
import { FunctionalCode, HighlightedTreeProcessor, InterproCode, InterproNamespace, NcbiId, NcbiTree, Peptide } from '@/logic';
import { Ref, ref, toRaw } from "vue";
import InterproTableItem from './InterproTableItem';
import useCsvDownload from '@/composables/useCsvDownload';
import VisualizationControls from '@/components/visualizations/VisualizationControls.vue';
import TreeView from '@/components/visualizations/TreeView.vue';
import { DataNodeLike } from 'unipept-visualizations';
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

const expanded = ref<InterproCode[]>([]);

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

const computingTree: Ref<Map<InterproCode, boolean>> = ref(new Map());

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

// TODO fix the type annotation of item here once VDataTable is stable
const onExpandClicked = (item: any) => {
    const idx: number = expanded.value.findIndex(i => i === item.raw.code);

    if (idx >= 0) {
        expanded.value.splice(idx, 1);
    } else {
        computeTree(item.raw.code);
        expanded.value.push(item.raw.code);
    }
}

const computeTree = async function(code: string) {
    computingTree.value.set(code, true);
    if (props.taxaToPeptides && props.ncbiTree) {
        const rootNode: any = await highlightedTreeProcessor.computeHighlightedTree(
            toRaw(props.itemToPeptides?.get(code)) ?? [],
            toRaw(props.ncbiTree),
            toRaw(props.taxaToPeptides)
        );

        treeAvailable.set(code, rootNode);
    }
    computingTree.value.set(code, false);
}
</script>

<style scoped>
.expand-container {
    padding: 0 !important;
    border-style: none solid solid solid;
    border-color: #ededed;
}

a {
    color: #2196f3;
    text-decoration: none;
}

a:hover {
    text-decoration: none;
}
</style>
