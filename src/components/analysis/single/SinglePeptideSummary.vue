<template>
    <div v-if="!loading">
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
                <div v-if="goTrust">
                    <span class="font-weight-bold">{{ goTrust.annotatedItems }} proteins</span>
                    ({{ toPercentage(goTrust.annotatedItems / goTrust.totalAmountOfItems) }})
                    have at least one <span class="font-weight-bold">GO term</span> assigned to them.
                </div>
                <div v-if="ecTrust">
                    <span class="font-weight-bold">{{ ecTrust.annotatedItems }} proteins</span>
                    ({{ toPercentage(ecTrust.annotatedItems / ecTrust.totalAmountOfItems) }})
                    have at least one <span class="font-weight-bold">EC number</span> assigned to them.
                </div>
                <div v-if="interproTrust">
                    <span class="font-weight-bold">{{ interproTrust.annotatedItems }} proteins</span>
                    ({{ toPercentage(interproTrust.annotatedItems / interproTrust.totalAmountOfItems) }})
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
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { Prop, Watch } from "vue-property-decorator";
import ProteinDefinition from "./../../../business/ontology/protein/ProteinDefinition";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import StringUtils from "./../../../business/misc/StringUtils";
import NcbiTaxon from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import ProteinProcessor from "./../../../business/processors/protein/ProteinProcessor";
import GoProteinCountTableProcessor from "./../../../business/processors/functional/go/GoProteinCountTableProcessor";
import EcProteinCountTableProcessor from "./../../../business/processors/functional/ec/EcProteinCountTableProcessor";
import InterproProteinCountTableProcessor
    from "./../../../business/processors/functional/interpro/InterproProteinCountTableProcessor";
import NcbiOntologyProcessor from "./../../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import CommunicationSource from "./../../../business/communication/source/CommunicationSource";

@Component
export default class SinglePeptideSummary extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

    private proteins: ProteinDefinition[] = [];
    private lca: NcbiTaxon = null;
    private commonLineage: NcbiTaxon[] = [];

    private goTrust: FunctionalTrust = null;
    private ecTrust: FunctionalTrust = null;
    private interproTrust: FunctionalTrust = null;

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
            this.proteins = await proteinProcessor.getProteinsByPeptide(this.peptide, this.equateIl);

            const goProcessor = new GoProteinCountTableProcessor(this.peptide, this.equateIl);
            this.goTrust = await goProcessor.getTrust();

            const ecProcessor = new EcProteinCountTableProcessor(this.peptide, this.equateIl);
            this.ecTrust = await ecProcessor.getTrust();

            const interproProcessor = new InterproProteinCountTableProcessor(this.peptide, this.equateIl);
            this.interproTrust = await interproProcessor.getTrust();

            const lca = await proteinProcessor.getLcaByPeptide(this.peptide, this.equateIl);
            const commonLineage = await proteinProcessor.getCommonLineageByPeptide(this.peptide, this.equateIl);

            const ncbiOntologyProcessor = new NcbiOntologyProcessor(this.communicationSource);
            const ontology = await ncbiOntologyProcessor.getOntologyByIds([lca, ...commonLineage]);

            this.lca = ontology.getDefinition(lca);

            this.commonLineage.length = 0;
            this.commonLineage.push(...commonLineage.map(c => ontology.getDefinition(c)));

            this.loading = false;
        }
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
