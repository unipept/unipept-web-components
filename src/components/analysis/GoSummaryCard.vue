<template>
    <v-card flat>
        <v-card-text>
            <TrustLine
                :trust="assay.goProteinCountTableProcessor.getTrust()"
                :faKind="{
                    singular: 'GO term',
                    plural: 'GO terms'
                }"
                :countKind="{
                    singular: 'protein',
                    plural: 'proteins'
                }"
            />

            <h2>Biological Process</h2>
            <v-row>
                <v-col cols=9>
                    <GoTable 
                        :items="assay.analysisInProgress ? [] : items(assay, GoNamespace.BiologicalProcess)"
                        :loading="assay.analysisInProgress" 
                        :showPercentage="false" 
                    />
                </v-col>
                <v-col cols=3>
                    <QuickGoCard 
                        :items="assay.analysisInProgress ? [] : items(assay, GoNamespace.BiologicalProcess)"
                        :namespace="GoNamespace.BiologicalProcess"
                        :n="3"
                    />
                </v-col>
            </v-row>

            <h2>Cellular Component</h2>
            <v-row>
                <v-col cols=9>
                    <GoTable 
                        :items="assay.analysisInProgress ? [] : items(assay, GoNamespace.CellularComponent)"
                        :loading="assay.analysisInProgress" 
                        :showPercentage="false" 
                    />
                </v-col>
                <v-col cols=3>
                    <QuickGoCard 
                        :items="assay.analysisInProgress ? [] : items(assay, GoNamespace.CellularComponent)" 
                        :namespace="GoNamespace.CellularComponent"
                        :n="3"
                    />
                </v-col>
            </v-row>

            <h2>Molecular Function</h2>
            <v-row>
                <v-col cols=9>
                    <GoTable 
                        :items="assay.analysisInProgress ? [] : items(assay, GoNamespace.MolecularFunction)"
                        :loading="assay.analysisInProgress" 
                        :showPercentage="false" 
                    />
                </v-col>
                <v-col cols=3>
                    <QuickGoCard 
                        :items="assay.analysisInProgress ? [] : items(assay, GoNamespace.MolecularFunction)" 
                        :namespace="GoNamespace.MolecularFunction"
                        :n="3"
                    />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { SinglePeptideAnalysisStatus } from '@/interface';
import { GoNamespace } from '@/logic';
import GoTable from '../tables/functional/GoTable.vue';
import GoTableItem from '../tables/functional/GoTableItem';
import TrustLine from '../util/TrustLine.vue';
import QuickGoCard from '../cards/QuickGoCard.vue';

export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const items = (assay: SinglePeptideAnalysisStatus, namespace: GoNamespace) => {
    const countTable = assay.goProteinCountTableProcessor.getCountTable(namespace);

    const items: GoTableItem[] = [];
    countTable.toMap().forEach((count, code) => {
        const definition = assay.goOntology.getDefinition(code) || { 
            name: "", 
            code: code
        };

        items.push({
            name: definition.name,
            code: definition.code,
            count: count,
            relativeCount: count / assay.goProteinCountTableProcessor.getTrust().totalAmountOfItems
        });
    });

    return items;
}
</script>
