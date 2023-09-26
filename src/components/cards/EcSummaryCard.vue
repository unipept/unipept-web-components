<template>
    <v-card flat>
        <v-card-text>
            <v-row v-if="!analysisInProgress">
                <v-col>
                    <TrustLine
                        class="mb-5"
                        :trust="ecProcessor.getTrust()"
                        :fa-kind="{
                            singular: 'EC number',
                            plural: 'EC numbers'
                        }"
                        :count-kind="{
                            singular: 'protein',
                            plural: 'proteins'
                        }"
                        :clickable="ncbiTree !== undefined"
                    />
                </v-col>
                <v-col
                    v-if="filter"
                    class="flex-grow-0"
                >
                    <v-btn
                        icon="mdi-cog-outline"
                        color="grey-darken-1"
                        @click="editFilterPercentageModalOpen = true"
                    />
                </v-col>
            </v-row>


            <ec-table
                :items="items"
                :loading="analysisInProgress"
                :show-percentage="showPercentage"
                :download-item="downloadItem"
                :ncbi-tree="ncbiTree"
                :taxa-to-peptides="(ncbiProcessor && ncbiTree) ? ncbiProcessor!.getAnnotationPeptideMapping() : undefined"
                :item-to-peptides="(ecProcessor && ncbiTree) ? ecProcessor.getAnnotationPeptideMapping() : undefined"
            />

            <VisualizationControls
                ref="treeview"
                class="mt-3"
                caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
                :loading="analysisInProgress || !ecTree"
                :fullscreen="() => toggle(treeview)"
                :download="() => downloadModalOpen = true"
                :reset="() => reset = true"
                :hide-download="isFullscreen"
            >
                <template #visualization>
                    <TreeView
                        :data="ecTree"
                        :loading="analysisInProgress || !ecTree"
                        :auto-resize="true"
                        :do-reset="reset"
                        @reset="reset = false"
                    />
                </template>
            </VisualizationControls>

            <download-image-modal
                :open-modal="downloadModalOpen"
                :image-source="treeviewElement()"
                supports-svg
                @close="downloadModalOpen = false"
            />

            <edit-filter-percentage-modal
                :model-value="filterPercentage"
                :open-modal="editFilterPercentageModalOpen"
                @close="editFilterPercentageModalOpen = false"
                @update:model-value="onUpdateFilterPercentage"
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import useFullscreen from '@/composables/useFullscreen';
import { EcCode, EcDefinition, FunctionalCountTableProcessor, LcaCountTableProcessor, NcbiTree, Ontology } from '@/logic';
import SvgImageSource from '@/logic/util/image/SvgImageSource';
import { DataNodeLike } from 'unipept-visualizations';
import { computed, ref, watch } from 'vue';
import DownloadImageModal from '../modals/DownloadImageModal.vue';
import EditFilterPercentageModal from '../modals/EditFilterPercentageModal.vue';
import EcTable from '../tables/functional/EcTable.vue';
import EcTableItem from '../tables/functional/EcTableItem';
import TrustLine from '../util/TrustLine.vue';
import TreeView from '../visualizations/TreeView.vue';
import VisualizationControls from '../visualizations/VisualizationControls.vue';

export interface Props {
    analysisInProgress: boolean
    showPercentage: boolean
    filter: number

    ecProcessor: FunctionalCountTableProcessor<EcCode, EcDefinition>
    ecOntology: Ontology<EcCode, EcDefinition>
    ecTree: DataNodeLike

    ncbiProcessor?: LcaCountTableProcessor
    ncbiTree?: NcbiTree

    downloadItem?: (code: EcCode) => Promise<void>
}

const props = defineProps<Props>();

const emits = defineEmits(["filterPercentageChange"])

const editFilterPercentageModalOpen = ref<boolean>(false);
const filterPercentage = ref<number>(props.filter);

const treeview = ref<HTMLElement | null>(null);

const { isFullscreen, toggle } = useFullscreen();

const reset = ref<boolean>(false);

const downloadModalOpen = ref<boolean>(false);

// @ts-ignore
const treeviewElement = () => new SvgImageSource(treeview.value?.$el.querySelector("svg"));

const items = computed(() => {
    if(!props.analysisInProgress) {
        const countTable = props.ecProcessor.getCountTable();

        const items: EcTableItem[] = [];
        countTable.toMap().forEach((count, code) => {
            const definition = props.ecOntology.getDefinition(code) || {
                name: "",
                code: code
            };

            items.push({
                name: definition.name,
                code: definition.code,
                count: count,
                relativeCount: count / props.ecProcessor.getTrust().totalAmountOfItems
            });
        });

        return items;
    }

    return [];
});

const onUpdateFilterPercentage = (newFilterPercentage: number) => {
    filterPercentage.value = newFilterPercentage;
    emits("filterPercentageChange", newFilterPercentage);
};

watch(() => props.filter, (newFilter) => {
    filterPercentage.value = newFilter;
});
</script>
