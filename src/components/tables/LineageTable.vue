<template>
    <div class="lineage-table">
        <v-card>
            <v-card-text>
                <p>
                    This table shows the complete taxonomic lineages of all taxa associated with the UniProt entries
                    whose protein sequence contains the tryptic peptide. The first column contains the taxon name
                    extracted from the UniProt entry, followed by columns representing taxonomic ranks ordered from
                    superkingdom on the left to forma on the right.
                </p>
                <v-data-table
                    dense
                    :items="assay.analysisInProgress ? [] : organisms(assay)"
                    :headers="headers"
                    :loading="assay.analysisInProgress"
                    :footer-props="{
                        'items-per-page-options': [10, 20, 50, 100, -1]
                    }"
                >
                    <template v-slot:body="{ items }">
                        <tbody>
                            <tr v-for="item in items" :key="item.name">
                                <td>
                                    <span class="font-small font-weight-bold">{{ item.definition.name }}</span>
                                </td>
                                <td v-for="l in item.lineage"
                                    :key="l ? l.id : generateId()"
                                    :class="[ l ? getColour(l.name) : '' ]">
                                    <a
                                        class="font-small font-weight-regular font-text no-link-colour"
                                        v-if="l"
                                        :href="'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=' + l.id"
                                        target="_blank">
                                        {{ l.name }}
                                        <v-icon x-small>mdi-open-in-new</v-icon>
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { SinglePeptideAnalysisStatus } from '@/interface';
import { NcbiRank, NcbiTaxon } from '@/logic';
import { computed, ref } from 'vue';
import { v4 as uuidv4 } from "uuid";

export interface Props {
    assay: SinglePeptideAnalysisStatus
}

defineProps<Props>();

const headers = computed(() => {
    const headers = [{
        text: "Organism",
        value: "name",
        width: "200px"
    }];

    headers.push(...Object.values(NcbiRank).map((v: string) => {
        return { text: v, value: "lineage" + v, width: "150px" }
    }));

    return headers;
});

const usedColours: Map<string, string> = new Map();
const colourCounter = ref<number>(0);

const organisms = (assay: SinglePeptideAnalysisStatus): { definition: NcbiTaxon, lineage: NcbiTaxon[] }[] => {
    const organismResult = [];
    for (const protein of assay.proteinProcessor.getProteins()) {
        const def = assay.ncbiOntology.getDefinition(protein.organism);

        if (def) {
            organismResult.push({
                definition: def,
                lineage: def.lineage.map(l => assay.ncbiOntology.getDefinition(l)).filter(e => e) as NcbiTaxon[]
            });
        }
    }

    return organismResult;
}

const getColour = (name: string): string => {
    if (!usedColours.has(name)) {
        usedColours.set(name, "c" + (colourCounter.value % 30));
        colourCounter.value++;
    }

    return usedColours.get(name)!;
}

const generateId = (): string => {
    return uuidv4();
}
</script>

<style scoped>
    .lineage-table .no-link-colour {
        color: rgba(0, 0, 0, 0.87);
    }

    .lineage-table .no-link-colour:hover {
        text-decoration: none;
    }

    .lineage-table .font-small {
        font-size: 10px;
    }

    .lineage-table table {
        table-layout: fixed;
    }

    /* All colors that are used in the LineageTable */
    .c0 {
        background: #f9f0ab;
    }
    .c1 {
        background: #e8e596;
    }
    .c2 {
        background: #f0e2a3;
    }
    .c3 {
        background: #ede487;
    }
    .c4 {
        background: #efd580;
    }
    .c5 {
        background: #f1cb82;
    }
    .c6 {
        background: #f1c298;
    }
    .c7 {
        background: #e8b598;
    }
    .c8 {
        background: #d5dda1;
    }
    .c9 {
        background: #c9d2b5;
    }
    .c10 {
        background: #aec1ad;
    }
    .c11 {
        background: #a7b8a8;
    }
    .c12 {
        background: #b49a3d;
    }
    .c13 {
        background: #b28647;
    }
    .c14 {
        background: #a97d32;
    }
    .c15 {
        background: #b68334;
    }
    .c16 {
        background: #d6a680;
    }
    .c17 {
        background: #dfad70;
    }
    .c18 {
        background: #a2765d;
    }
    .c19 {
        background: #9f6652;
    }
    .c20 {
        background: #b9763f;
    }
    .c21 {
        background: #bf6e5d;
    }
    .c22 {
        background: #af643c;
    }
    .c23 {
        background: #9b4c3f;
    }
    .c24 {
        background: #72659d;
    }
    .c25 {
        background: #8a6e9e;
    }
    .c26 {
        background: #8f5c85;
    }
    .c27 {
        background: #934b8b;
    }
    .c28 {
        background: #9d4e87;
    }
    .c29 {
        background: #92538c;
    }
</style>
