<template>
    <v-card flat>
        <v-card-text>
            <v-row v-if="!analysisInProgress">
                <v-col>
                    <TrustLine 
                        class="mb-5"
                        :trust="ecProcessor?.getTrust()"
                        :faKind="{
                            singular: 'EC number',
                            plural: 'EC numbers'
                        }"
                        :countKind="{
                            singular: 'protein',
                            plural: 'proteins'
                        }"
                    />
                </v-col>
                <v-col class="flex-grow-0">
                    <v-btn icon @click="editFilterPercentageModalOpen = true">
                        <v-icon color="grey darken-1">mdi-cog-outline</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            

            <EcTable 
                :items="items"
                :loading="analysisInProgress" 
                :showPercentage="showPercentage"
                :downloadItem="downloadItem"
                :ncbiTree="ncbiTree"
                :taxaToPeptides="(ncbiProcessor && ncbiTree) ? ncbiProcessor.getAnnotationPeptideMapping() : undefined"
                :itemToPeptides="(ecProcessor && ncbiTree) ? ecProcessor.getAnnotationPeptideMapping() : undefined"
            />

            <VisualizationControls
                ref="treeview"
                class="mt-3"
                caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
                :loading="analysisInProgress || !ecTree"
                :fullscreen="() => toggle(treeview)" 
                :download="() => downloadModalOpen = true"
                :reset="() => reset = true"
                :hideDownload="isFullscreen"
            >
                <template #visualization>
                    <TreeView 
                        :data="ecTree"
                        :loading="analysisInProgress || !ecTree"
                        :autoResize="true"
                        :doReset="reset"
                        @reset="reset = false"
                    />
                </template>
            </VisualizationControls>
            
            <DownloadImageModal 
                :openModal="downloadModalOpen"
                :imageSource="treeviewElement()"
                @close="downloadModalOpen = false"
                supportsSvg
            />

            <EditFilterPercentageModal
                :model-value="filterPercentage"
                :openModal="editFilterPercentageModalOpen"
                @close="editFilterPercentageModalOpen = false"
                @update:model-value="onUpdateFilterPercentage"
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import useFullscreen from '@/composables/useFullscreen';
import { CsvUtils, EcCode, EcDefinition, FunctionalCountTableProcessor, FunctionalSummaryProcessor, LcaCountTableProcessor, NcbiTree, NetworkUtils, Ontology, PeptideCountTableProcessor } from '@/logic';
import SvgImageSource from '@/logic/util/image/SvgImageSource';
import { DataNodeLike } from 'unipept-visualizations/types';
import { computed, ref, watch } from 'vue';
import { VCard, VCardText } from 'vuetify/lib';
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

const emits = defineEmits(["filerPercentageChange"])

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
    emits("filerPercentageChange", newFilterPercentage);
};

watch(() => props.filter, (newFilter) => {
    console.log("newFilter ec (1)", newFilter)
    filterPercentage.value = newFilter;
    console.log("newFilter ec (2)", filterPercentage.value)
});
</script>
