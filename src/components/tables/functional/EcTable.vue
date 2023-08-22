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
            <!-- @vue-ignore (TODO: types should work once data tables are not in labs anymore) -->
            <template #header.action>
                <v-tooltip text="Download table as CSV">
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            icon="mdi-download"
                            @click="downloadCsv(items)"
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
                            @click="downloadEcItem(item.raw.code)"
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
import EcTableItem from './EcTableItem';
import useCsvDownload from '@/composables/useCsvDownload';
import { EcCode, FunctionalCode, HighlightedTreeProcessor, NcbiId, NcbiTree, Peptide } from "@/logic";
import { Ref, ref, toRaw } from "vue";
import { DataNodeLike } from 'unipept-visualizations/types';
import VisualizationControls from '@/components/visualizations/VisualizationControls.vue';
import TreeView from '@/components/visualizations/TreeView.vue';
import { VDataTable } from 'vuetify/labs/VDataTable';

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

const computingTree: Ref<Map<EcCode, boolean>> = ref(new Map());

const headers = ref([
    {
        title: "Peptides",
        align: "start",
        key: "count",
        width: "20%"
    },
    {
        title: "EC-number",
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
        title: "",
        align: "center",
        key: "action",
        width: "5%",
        sortable: false
    }
]);

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
