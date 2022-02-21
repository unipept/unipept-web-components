<template>
    <div class="lineage-tree">
        <v-card>
            <v-card-text>
                <span>
                    This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein
                    sequence contains the tryptic peptide.
                </span>
                <treeview-visualization
                    analysis-type="Single peptide"
                    :tree="taxaTree"
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
import Tree from "./../../business/ontology/taxonomic/Tree";
import Treeview from "./../../components/visualizations/Treeview.vue";
import TreeviewVisualization from "./../../components/visualizations/TreeviewVisualization.vue";

@Component({
    components: { TreeviewVisualization, Treeview }
})
export default class LineageTree extends Vue {
    get taxaTree(): Tree {
        return this.$store.getters.peptideStatus.taxaTree;
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
