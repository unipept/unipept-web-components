<template>
    <v-card>
        <v-card-text>
            <span>
                This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein
                sequence contains the tryptic peptide.
            </span>
            <treeview-visualization :tree="tree" :height="400"></treeview-visualization>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import Tree from "./../../business/ontology/taxonomic/Tree";
import Treeview from "./../../components/visualizations/Treeview.vue";
import TreeviewVisualization from "./../../components/visualizations/TreeviewVisualization.vue";
import ProteinProcessor from "./../../business/processors/protein/ProteinProcessor";
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import { CountTable } from "./../../business/counts/CountTable";
import NcbiOntologyProcessor from "./../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";

@Component({
    components: { TreeviewVisualization, Treeview }
})
export default class LineageTree extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;

    private tree: Tree = null;

    private loading: boolean = false;

    private mounted() {
        this.onInputsChanged();
    }

    @Watch("peptide")
    @Watch("equateIl")
    private async onInputsChanged() {
        if (this.peptide) {
            this.loading = true;

            const proteinProcessor = new ProteinProcessor();
            const proteins = await proteinProcessor.getProteinsByPeptide(this.peptide, this.equateIl);

            const taxaCounts = new Map<NcbiId, number>();

            for (const protein of proteins) {
                taxaCounts.set(protein.organism, (taxaCounts.get(protein.organism) || 0) + 1);
            }

            const taxaCountTable = new CountTable<NcbiId>(taxaCounts);

            const taxaOntologyProcessor = new NcbiOntologyProcessor();
            const taxaOntology = await taxaOntologyProcessor.getOntology(taxaCountTable);

            this.tree = new Tree(taxaCountTable, taxaOntology);

            this.loading = false;
        }
    }
}
</script>

<style>
    .v-card__text span {
        color: #555555;
    }
</style>
