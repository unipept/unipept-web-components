<template>
    <div v-if="!analysisIsLoading">
        <div class="display-1">Tryptic peptide analysis of {{ peptide }}</div>
        <div class="subtitle-1">
            {{ peptide }} was found in
            <span class="font-weight-bold">{{ proteins.length }}</span>
            UniProt entries with a lowest common ancestor of
            <span class="font-weight-bold" v-if="lca">{{ lca.name }}</span>
        </div>
        <div class="subtitle-2">
            <span v-if="equateIl">Equate I/L is enabled.</span>
            <span v-else>Equate I/L is disabled.</span>
        </div>
        <v-row>
            <v-col :cols="6">
                <div class="headline">Biodiversity</div>
                <div v-if="lca">
                    The <span class="font-weight-bold">lowest common ancestor</span> is
                    <a :href="`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${lca.id}`" target="_blank">
                        {{ lca.name }}
                    </a> ({{ lca.rank }}).
                </div>
                <div>
                    The <span class="font-weight-bold">common lineage</span> for all these proteins is:
                    <span v-if="commonLineage.length > 0">
                        <span v-for="[idx, node] of commonLineage.entries()" :key="idx">
                            <a v-if="node" :href="`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${node.id}`" target="_blank">
                                {{ node.name }}
                            </a>
                            <span v-else>
                                Unknown
                            </span>
                            <span v-if="idx + 1 < commonLineage.length"> > </span>
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
                    <span class="font-weight-bold">{{ goProteinProcessor.getTrust().annotatedItems }} proteins</span>
                    ({{ toPercentage(goProteinProcessor.getTrust().annotatedItems / goProteinProcessor.getTrust().totalAmountOfItems) }})
                    have at least one <span class="font-weight-bold">GO term</span> assigned to them.
                </div>

                <div>
                    <span class="font-weight-bold">{{ ecProteinProcessor.getTrust().annotatedItems }} proteins</span>
                    ({{ toPercentage(ecProteinProcessor.getTrust().annotatedItems / ecProteinProcessor.getTrust().totalAmountOfItems) }})
                    have at least one <span class="font-weight-bold">EC number</span> assigned to them.
                </div>

                <div>
                    <span class="font-weight-bold">{{ interproProteinProcessor.getTrust().annotatedItems }} proteins</span>
                    ({{ toPercentage(interproProteinProcessor.getTrust().annotatedItems / interproProteinProcessor.getTrust().totalAmountOfItems) }})
                    have at least one <span class="font-weight-bold">InterPro entry</span> assigned to them.
                </div>
            </v-col>
        </v-row>
    </div>
    <div v-else>
        <div class="display-1">Tryptic peptide analysis of {{ peptide }}</div>
        <span class="subtitle-1">Computing summary...</span>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ProteinDefinition from "./../../../business/ontology/protein/ProteinDefinition";
import StringUtils from "./../../../business/misc/StringUtils";
import NcbiTaxon, { NcbiId } from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import ProteinProcessor from "./../../../business/processors/protein/ProteinProcessor";
import GoProteinCountTableProcessor from "./../../../business/processors/functional/go/GoProteinCountTableProcessor";
import EcProteinCountTableProcessor from "./../../../business/processors/functional/ec/EcProteinCountTableProcessor";
import InterproProteinCountTableProcessor
    from "./../../../business/processors/functional/interpro/InterproProteinCountTableProcessor";
import { Ontology } from "@/business";

@Component
export default class SinglePeptideSummary extends Vue {
    get peptide(): string {
        return this.$store.getters.peptideStatus.peptide;
    }

    get equateIl(): boolean {
        return this.$store.getters.peptideStatus.equateIl;
    }

    get proteinProcessor(): ProteinProcessor {
        return this.$store.getters.peptideStatus.proteinProcessor;
    }

    get goProteinProcessor(): GoProteinCountTableProcessor {
        return this.$store.getters.peptideStatus.goProteinCountTableProcessor;
    }

    get ecProteinProcessor(): EcProteinCountTableProcessor {
        return this.$store.getters.peptideStatus.ecProteinCountTableProcessor;
    }

    get interproProteinProcessor(): InterproProteinCountTableProcessor {
        return this.$store.getters.peptideStatus.interproProteinCountTableProcessor;
    }

    get ncbiOntology(): Ontology<NcbiId, NcbiTaxon> {
        return this.$store.getters.peptideStatus.ncbiOntology;
    }

    get analysisIsLoading(): boolean {
        return this.$store.getters.peptideStatus.analysisInProgress;
    }

    get commonLineage(): NcbiTaxon[] {
        return this.proteinProcessor.getCommonLineage().map(c => this.ncbiOntology.getDefinition(c));
    }

    get lca(): NcbiTaxon {
        return this.ncbiOntology.getDefinition(this.proteinProcessor.getLca());
    }

    get proteins(): ProteinDefinition[] {
        return this.proteinProcessor.getProteins();
    }

    private toPercentage(n: number): string {
        if (Number.isNaN(n)) {
            n = 0;
        }
        return StringUtils.numberToPercent(n);
    }
}
</script>

<style scoped>

</style>
