<template>
    <div>
        <div class="display-1">Tryptic peptide analysis of {{ peptide }}</div>
        <div class="subtitle-1">
            {{ peptide }} was found in
            <span class="font-weight-bold">{{ proteins.length }}</span>
            UniProt entries with a lowest common ancestor of
            <span class="font-weight-bold" v-if="lca">{{ lca.name }}</span>
        </div>
        <v-row>
            <v-col :cols="6">
                <div class="headline">Biodiversity</div>
                <div v-if="lca">
                    The <span class="font-weight-bold">lowest common ancestor</span> is {{ lca.name }}.
                </div>
                <div>
                    The <span class="font-weight-bold">common lineage</span> for all these proteins is:
                    {{ commonLineage }}
                </div>
            </v-col>
            <v-col :cols="6">
                <div class="headline">Function</div>
                <div v-if="goTrust">
                    <span class="font-weight-bold">{{ goTrust.annotatedPeptides }} proteins</span>
                    ({{ toPercentage(goTrust.annotatedPeptides / goTrust.totalAmountOfPeptides) }})
                    have at least one <span class="font-weight-bold">GO term</span> assigned to them.
                </div>
                <div v-if="ecTrust">
                    <span class="font-weight-bold">{{ ecTrust.annotatedPeptides }} proteins</span>
                    ({{ toPercentage(ecTrust.annotatedPeptides / ecTrust.totalAmountOfPeptides) }})
                    have at least one <span class="font-weight-bold">EC number</span> assigned to them.
                </div>
                <div v-if="interproTrust">
                    <span class="font-weight-bold">{{ interproTrust.annotatedPeptides }} proteins</span>
                    ({{ toPercentage(interproTrust.annotatedPeptides / interproTrust.totalAmountOfPeptides) }})
                    have at least one <span class="font-weight-bold">InterPro entry</span> assigned to them.
                </div>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { Prop, Watch } from "vue-property-decorator";
import ProteinDefinition from "./../../../business/ontology/protein/ProteinDefinition";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import StringUtils from "./../../../business/misc/StringUtils";
import NcbiTaxon from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import ProteinProcessor from "./../../../business/processors/protein/ProteinProcessor";

@Component
export default class SinglePeptideSummary extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;

    private proteins: ProteinDefinition[] = [];
    private lca: NcbiTaxon = null;
    private commonLineage: string = "";

    private goTrust: FunctionalTrust = null;
    private ecTrust: FunctionalTrust = null;
    private interproTrust: FunctionalTrust = null;

    private mounted() {
        this.onInputsChanged();
    }

    @Watch("peptide")
    @Watch("equateIl")
    private async onInputsChanged() {
        if (this.peptide) {
            const proteinProcessor = new ProteinProcessor();
            this.proteins = await proteinProcessor.getProteinsByPeptide(this.peptide, this.equateIl);

            // TODO use protein count table processors to get trust information, once these are available here.
        }
    }

    private toPercentage(n: number): string {
        return StringUtils.numberToPercent(n);
    }
}
</script>

<style scoped>

</style>
