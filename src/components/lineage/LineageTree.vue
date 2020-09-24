<template>
    <div class="lineage-tree">
        <v-card>
            <v-card-text v-if="loading" class="d-flex justify-center">
                <v-progress-circular :size="70" :width="7" indeterminate color="primary"></v-progress-circular>
            </v-card-text>
            <v-card-text v-else>
                <span>
                    This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein
                    sequence contains the tryptic peptide.
                </span>
                <treeview-visualization
                    analysis-type="Single peptide"
                    :tree="tree"
                    :height="400"
                    :tooltip="tooltipContent">
                </treeview-visualization>
            </v-card-text>
        </v-card>
    </div>
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
import CommunicationSource from "./../../business/communication/source/CommunicationSource";

@Component({
    components: { TreeviewVisualization, Treeview }
})
export default class LineageTree extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

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

            const taxaOntologyProcessor = new NcbiOntologyProcessor(this.communicationSource);
            const taxaOntology = await taxaOntologyProcessor.getOntology(taxaCountTable);

            this.tree = new Tree(taxaCountTable, taxaOntology);

            this.loading = false;
        }
    }

    private tooltipContent(d: any): string {
        return "<b>" + d.name + "</b> (" + d.rank + ")<br/>" +
            (!d.data.count ? "0" : d.data.count) +
            (d.data.count && d.data.count === 1 ? " match" : " matches");
    }
}
</script>

<style scoped>
</style>
