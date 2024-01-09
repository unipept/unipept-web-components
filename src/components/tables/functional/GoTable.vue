<template>
    <div>
        <!-- @vue-ignore (TODO: types should work once data tables are not in labs anymore) -->
        <v-data-table
            v-model:expanded="expanded"
            :headers="headers"
            :loading="loading"
            :items="items"
            :sort-by="['count']"
            :sort-desc="[true]"
            :items-per-page="5"
            item-value="code"
            show-expand
        >
            <template #header.action>
                <v-tooltip text="Download table as CSV">
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            icon="mdi-download"
                            variant="plain"
                            @click="downloadCsv(items)"
                        />
                    </template>
                </v-tooltip>
            </template>

            <!-- @vue-ignore (TODO: types should work once data tables are not in labs anymore) -->
            <template #item.data-table-expand="{ item }">
                <v-btn
                    v-if="ncbiTree"
                    size="small"
                    variant="plain"
                    :icon="expanded.findIndex(i => i === item.code) !== -1 ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                    :disabled="item.totalAnnotations === 0"
                    @click="onExpandClicked(item)"
                />
            </template>

            <template #item.count="{ item }">
                <div
                    :style="{
                        padding: '12px',
                        background: 'linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ' +
                            item.relativeCount * 100 + '%, rgba(255,255,255,0) ' + item.relativeCount * 100 + '%)',
                    }"
                >
                    {{ showPercentage ? (item.relativeCount * 100).toFixed(2) + " %" : item.count }}
                </div>
            </template>

            <template #item.code="{ item }">
                <a
                    :href="url(item.code)"
                    target="_blank"
                    class="font-regular"
                >
                    {{ item.code }}
                    <v-icon size="x-small">mdi-open-in-new</v-icon>
                </a>
            </template>

            <template #item.name="{ item }">
                <span style="text-overflow: ellipsis;">
                    {{ item.name }}
                </span>
            </template>

            <template #item.action="{ item }">
                <v-tooltip
                    v-if="downloadItem !== undefined"
                    text="Download CSV summary of the filtered functional annotation"
                >
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            icon="mdi-download"
                            variant="plain"
                            @click="downloadGoItem(item.code)"
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
                        v-if="computingTree.has(item.code) && !computingTree.get(item.code)"
                        ref="treeview"
                        caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
                        internal-download
                        :loading="computingTree.get(item.code)!"
                    >
                        <template #visualization>
                            <TreeView
                                :data="treeAvailable.get(item.code)!"
                                :loading="computingTree.get(item.code) && !treeAvailable.get(item.code)"
                                :auto-resize="true"
                                :height="350"
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
import GoTableItem from './GoTableItem';
import useCsvDownload from '@/composables/useCsvDownload';
import { FunctionalCode, GoCode, HighlightedTreeProcessor, InterproCode, NcbiId, NcbiTree, Peptide } from "@/logic";
import { Ref, ref, toRaw } from "vue";
import TreeView from '@/components/visualizations/TreeView.vue';
import VisualizationControls from '@/components/visualizations/VisualizationControls.vue';
import { DataNodeLike } from 'unipept-visualizations';

export interface Props {
    items: GoTableItem[]
    loading: boolean
    showPercentage: boolean
    ncbiTree?: NcbiTree
    taxaToPeptides?: Map<NcbiId, Peptide[]>
    itemToPeptides?: Map<GoCode, Peptide[]>
    downloadItem?: (code: FunctionalCode) => Promise<void>
}

const props = defineProps<Props>();

const expanded = ref<GoCode[]>([]);

const headers = ref([
    {
        title: "Peptides",
        align: "start",
        key: "count",
        width: "20%"
    },
    {
        title: "GO-term",
        align: "start",
        key: "code",
        width: "30%"
    },
    {
        title: "Name",
        align: "start",
        key: "name",
        width: "45%"
    },
    {
        title: "Action",
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

// TODO fix the type annotation of item here once VDataTable is stable
const onExpandClicked = (item: any) => {
    const idx: number = expanded.value.findIndex(i => i === item.code);

    if (idx >= 0) {
        expanded.value.splice(idx, 1);
    } else {
        computeTree(item.code);
        expanded.value.push(item.code);
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
