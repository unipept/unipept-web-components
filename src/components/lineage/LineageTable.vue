<template>
    <div class="lineage-table">
        <v-card>
            <v-card-text v-if="loading" class="d-flex justify-center">
                <v-progress-circular :size="70" :width="7" indeterminate color="primary"></v-progress-circular>
            </v-card-text>
            <v-card-text v-else>
                <p>
                    This table shows the complete taxonomic lineages of all taxa associated with the UniProt entries whose
                    protein sequence contains the tryptic peptide. The first column contains the taxon name extracted from the
                    UniProt entry, followed by columns representing taxonomic ranks ordered from superkingdom on the left to
                    forma on the right.
                </p>
                <v-simple-table dense>
                    <template v-slot:default>
                        <thead>
                        <tr>
                            <th style="width: 200px;">Organism</th>
                            <th v-for="rank in taxonRanks" style="width: 120px;" class="text-left" :key="rank">{{ rank }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="organism in organisms" :key="organism.definition.id">
                            <td style="width: 200px;" class="font-small font-weight-bold">{{ organism.definition.name }}</td>
                            <td
                                style="width: 120px;"
                                v-for="l in organism.lineage"
                                :key="l ? l.id : generateId()"
                                :class="[ l ? getColour(l.name) : '' ]">
                                <a
                                    class="font-small font-weight-regular font-text no-link-colour"
                                    v-if="l"
                                    :href="'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=' + l.id">
                                    {{ l.name }}
                                    <v-icon x-small>mdi-open-in-new</v-icon>
                                </a>
                                <span v-else>
                            </span>
                            </td>
                        </tr>
                        </tbody>
                    </template>
                </v-simple-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import { NcbiRank } from "./../../business/ontology/taxonomic/ncbi/NcbiRank";
import NcbiTaxon, { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import ProteinProcessor from "./../../business/processors/protein/ProteinProcessor";
import NcbiOntologyProcessor from "./../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import { Ontology } from "./../../business/ontology/Ontology";
import { v4 as uuidv4 } from "uuid";

@Component
export default class LineageTable extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;

    private taxonRanks: string[] = Object.values(NcbiRank);
    private organisms: { definition: NcbiTaxon, lineage: NcbiTaxon[] }[] = [];

    private usedColours: Map<string, string> = new Map();
    private colourCounter: number = 0;

    private loading: boolean = false;

    private mounted() {
        this.onInputChanged();
    }

    @Watch("peptide")
    @Watch("equateIl")
    private async onInputChanged() {
        if (this.peptide) {
            this.loading = true;
            const proteinProcessor = new ProteinProcessor();
            const proteins = await proteinProcessor.getProteinsByPeptide(this.peptide, this.equateIl);

            const organismIds = proteins.map(p => p.organism);

            const ncbiOntologyProcessor = new NcbiOntologyProcessor();
            const ontology = await ncbiOntologyProcessor.getOntologyByIds(organismIds);

            this.organisms.length = 0;
            for (const id of organismIds) {
                const def = ontology.getDefinition(id);

                if (def) {
                    this.organisms.push({
                        definition: def,
                        lineage: def.lineage.map(l => ontology.getDefinition(l))
                    });
                }
            }

            this.loading = false;
        }
    }

    private getColour(name): string {
        if (!this.usedColours.has(name)) {
            this.usedColours.set(name, "c" + (this.colourCounter % 30));
            this.colourCounter++;
        }

        return this.usedColours.get(name);
    }

    private generateId(): string {
        return uuidv4();
    }
}
</script>

<style>
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
