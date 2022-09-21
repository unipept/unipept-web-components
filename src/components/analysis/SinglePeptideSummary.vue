<template>
    <div v-if="!assay.analysisInProgress">
        <div class="display-1">Tryptic peptide analysis of {{ assay.peptide }}</div>
        <div class="subtitle-1">
            {{ assay.peptide }} was found in
            <span class="font-weight-bold">{{ proteins(assay).length }}</span>
            UniProt entries with a lowest common ancestor of 
            <span class="font-weight-bold">{{ lca(assay)?.name }}</span>
        </div>
        <div class="subtitle-2">
            <span v-if="assay.equateIl">Equate I/L is enabled.</span>
            <span v-else>Equate I/L is disabled.</span>
        </div>
        <v-row>
            <v-col :cols="6">
                <div class="headline">Biodiversity</div>
                <div v-if="lca(assay)">
                    The <span class="font-weight-bold">lowest common ancestor</span> is
                    <a :href="`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${lca(assay)?.id}`" target="_blank">
                        {{ lca(assay)?.name }}
                    </a> ({{ lca(assay)?.rank }}).
                </div>
                <div>
                    The <span class="font-weight-bold">common lineage</span> for all these proteins is:
                    <span v-if="commonLineage(assay).length > 0">
                        <span v-for="[idx, node] of commonLineage(assay).entries()" :key="idx">
                            <a v-if="node" :href="`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${node.id}`" target="_blank">
                                {{ node.name }}
                            </a>
                            <span v-else>
                                Unknown
                            </span>
                            <span v-if="idx + 1 < commonLineage(assay).length"> > </span>
                        </span>
                    </span>
                    <span v-else>
                        root
                    </span>
                </div>
            </v-col>
            <v-col :cols="6">
                <div class="headline">Function</div>
                <div>
                    <span class="font-weight-bold">{{ assay.goProteinCountTableProcessor.getTrust().annotatedItems }} proteins</span>
                    ({{ toPercentage(assay.goProteinCountTableProcessor.getTrust().annotatedItems / assay.goProteinCountTableProcessor.getTrust().totalAmountOfItems) }})
                    have at least one <span class="font-weight-bold">GO term</span> assigned to them.
                </div>

                <div>
                    <span class="font-weight-bold">{{ assay.ecProteinCountTableProcessor.getTrust().annotatedItems }} proteins</span>
                    ({{ toPercentage(assay.ecProteinCountTableProcessor.getTrust().annotatedItems / assay.ecProteinCountTableProcessor.getTrust().totalAmountOfItems) }})
                    have at least one <span class="font-weight-bold">EC number</span> assigned to them.
                </div>

                <div>
                    <span class="font-weight-bold">{{ assay.interproProteinCountTableProcessor.getTrust().annotatedItems }} proteins</span>
                    ({{ toPercentage(assay.interproProteinCountTableProcessor.getTrust().annotatedItems / assay.interproProteinCountTableProcessor.getTrust().totalAmountOfItems) }})
                    have at least one <span class="font-weight-bold">InterPro entry</span> assigned to them.
                </div>
            </v-col>
        </v-row>
    </div>
    <div v-else>
        <div class="display-1">Tryptic peptide analysis of {{ assay.peptide }}</div>
        <span class="subtitle-1">Computing summary...</span>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { SinglePeptideAnalysisStatus } from '@/interface'
import { NcbiTaxon, ProteinDefinition, StringUtils } from '@/logic';

export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const proteins = (assay: SinglePeptideAnalysisStatus): ProteinDefinition[] => {
    return assay.proteinProcessor.getProteins();
};

const lca = (assay: SinglePeptideAnalysisStatus): (NcbiTaxon | undefined) => {
    return assay.ncbiOntology.getDefinition(assay.proteinProcessor.getLca());
};

const commonLineage = (assay: SinglePeptideAnalysisStatus): (NcbiTaxon | undefined)[] => {
    return assay.proteinProcessor.getCommonLineage().map(c => assay.ncbiOntology.getDefinition(c));
};

const toPercentage = (n: number): string => {
    if (Number.isNaN(n)) {
        n = 0;
    }
    return StringUtils.numberToPercent(n);
}
</script>