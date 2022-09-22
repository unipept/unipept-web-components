<template>
    <v-card flat>
        <v-card-text>
            <TrustLine
                :trust="assay.ecProteinCountTableProcessor?.getTrust()"
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
                :items="assay.analysisInProgress ? [] : items(assay)"
                :loading="assay.analysisInProgress" 
                :showPercentage="false" 
            />

            <v-card class="mt-5" outlined>
                <v-btn
                    small
                    depressed
                    class="item-treeview-dl-btn"
                    @click=""
                >
                    <v-icon>mdi-download</v-icon> Save as image
                </v-btn>
                <TreeView 
                    :data="assay.ecTree"
                    :loading="assay.analysisInProgress"
                    :width="800"
                    :height="300"
                    :autoResize="true"
                />
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { SinglePeptideAnalysisStatus } from '@/interface';
import EcTable from '../tables/functional/EcTable.vue';
import EcTableItem from '../tables/functional/EcTableItem';
import TrustLine from '../util/TrustLine.vue';
import TreeView from '../visualizations/TreeView.vue';

export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const items = (assay: SinglePeptideAnalysisStatus) => {
    const countTable = assay.ecProteinCountTableProcessor.getCountTable();

    const items: EcTableItem[] = [];
    countTable.toMap().forEach((count, code) => {
        const definition = assay.ecOntology.getDefinition(code) || { 
            name: "", 
            code: code
        };

        items.push({
            name: definition.name,
            code: definition.code,
            count: count,
            relativeCount: count / assay.ecProteinCountTableProcessor.getTrust().totalAmountOfItems
        });
    });

    return items;
}
</script>
