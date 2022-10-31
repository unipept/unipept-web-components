<template>
    <v-card flat>
        <v-card-text>
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

            <EcTable 
                :items="items"
                :loading="analysisInProgress" 
                :showPercentage="showPercentage" 
            />

            <TreeViewControls
                ref="treeView"
                class="mt-3"
                :loading="analysisInProgress"
                :fullscreen="() => toggle(treeView)" 
                :download="downloadSvg"
                :reset="() => reset = true"
            >
                <template #treeview>
                    <TreeView 
                        :data="ecTree"
                        :loading="analysisInProgress || !ecTree"
                        :autoResize="true"
                        :doReset="reset"
                        @reset="reset = false"
                    />
                </template>
            </TreeViewControls>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { useSvgDownload } from '@/composables';
import useFullscreen from '@/composables/useFullscreen';
import { EcCode, EcDefinition, FunctionalCountTableProcessor, Ontology } from '@/logic';
import { computed, ref } from 'vue';
import EcTable from '../tables/functional/EcTable.vue';
import EcTableItem from '../tables/functional/EcTableItem';
import TrustLine from '../util/TrustLine.vue';
import TreeView from '../visualizations/TreeView.vue';
import TreeViewControls from '../visualizations/TreeViewControls.vue';

export interface Props {
    analysisInProgress: boolean
    showPercentage: boolean
    
    ecProcessor: FunctionalCountTableProcessor<EcCode, EcDefinition>
    ecOntology: Ontology<EcCode, EcDefinition>
    ecTree: any
}

const props = defineProps<Props>();

const treeView = ref<HTMLElement | null>(null);

const { toggle } = useFullscreen();
const { download } = useSvgDownload();

const downloadSvg = () => {
    // @ts-ignore
    const svg = treeView.value?.$el.querySelector("svg");
    download(svg, "EcTree.svg");
}

const reset = ref<boolean>(false);

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
</script>
