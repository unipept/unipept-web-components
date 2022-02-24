<template>
    <v-card flat>
        <v-card-text>
            <span v-html="trustLine" class="go-trust"></span>
            <amount-table
                annotation-name="EC-number"
                :item-retriever="itemRetriever"
                :external-url-constructor="getUrl"
                :show-percentage="false">
            </amount-table>
            <v-card outlined>
                <v-btn
                    small
                    depressed
                    class="item-treeview-dl-btn"
                    @click="$refs.imageDownloadModal.downloadSVG('unipept_treeview', '#ec-treeview svg')">
                    <v-icon>mdi-download</v-icon>
                    Save as image
                </v-btn>
                <treeview
                    id="ec-treeview"
                    :data="ecTree"
                    :autoResize="true"
                    :height="300"
                    :width="800"
                    :tooltip-text="ecTreeTooltip"
                    :enableAutoExpand="true">
                </treeview>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { Prop, Watch } from "vue-property-decorator";
import EcDefinition, { EcCode } from "./../../../business/ontology/functional/ec/EcDefinition";
import EcProteinCountTableProcessor from "./../../../business/processors/functional/ec/EcProteinCountTableProcessor";
import EcOntologyProcessor from "./../../../business/ontology/functional/ec/EcOntologyProcessor";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import { FunctionalUtils } from "./../functional/FunctionalUtils";
import CommunicationSource from "./../../../business/communication/source/CommunicationSource";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import AmountTable from "@/components/tables/AmountTable.vue";
import SingleAmountTableItemRetriever from "@/components/analysis/single/SingleAmountTableItemRetriever";
import Treeview from "@/components/visualizations/Treeview.vue";
import { CountTable, Ontology } from "@/business";
import { DataNodeLike } from "unipept-visualizations";

@Component({
    components: { AmountTable, Treeview }
})
export default class SingleEcSummaryCard extends Vue {
    get ecProteinProcessor(): EcProteinCountTableProcessor {
        return this.$store.getters.peptideStatus.ecProteinCountTableProcessor;
    }

    get ecOntology(): Ontology<EcCode, EcDefinition> {
        return this.$store.getters.peptideStatus.ecOntology;
    }

    get trust(): FunctionalTrust {
        return this.ecProteinProcessor.getTrust();
    }

    get trustLine(): string {
        return FunctionalUtils.computeTrustLine(this.trust, "EC-number", "protein");
    }

    get itemRetriever(): AmountTableItemRetriever<EcCode, EcDefinition> {
        return new SingleAmountTableItemRetriever(
            this.ecProteinProcessor.getCountTable(),
            this.ecOntology,
            this.trust.totalAmountOfItems
        );
    }

    get ecTree(): DataNodeLike {
        return this.$store.getters.peptideStatus.ecTree;
    }

    private getUrl(code: string): string {
        return `https://www.uniprot.org/uniprot/?query=${code}`
    }

    // TODO, once we are using Vue 3 we can more properly get rid of the code duplication with MultiEcSummaryCard by
    // using inheritance.
    private ecTreeTooltip: (d: any) => string = (d: any) => {
        const fullCode = (d.name + ".-.-.-.-").split(".").splice(0, 4).join(".");
        let tip = "";
        tip += `<div class="tooltip-fa-text">
                    <strong>${d.count} peptides</strong> have at least one EC number within ${fullCode},<br>`;

        if (d.selfCount == 0) {
            tip += "no specific annotations";
        } else {
            if (d.selfCount == d.count) {
                tip += " <strong>all specifically</strong> for this number";
            } else {
                tip += ` <strong>${d.selfCount} specifically</strong> for this number`;
            }
        }

        tip += "</div>";
        return tip;
    }
}
</script>

<style scoped>

</style>
