<docs>
    A variant of the EcSummaryCard that's specifically designed for the analysis of a single peptide. This variant works
    with a peptide as input and provides the counted EC-numbers in function of the amount of proteins associated with
    it.
</docs>

<template>
    <v-card flat>
        <v-card-text>
            <span v-html="trustLine" class="go-trust"></span>
            <amount-table
                annotation-name="EC-number"
                :item-retriever="itemRetriever"
                :external-url-constructor="getUrl"
                :loading="isComputing"
                :show-percentage="false">
            </amount-table>
            <v-card outlined>
                <v-btn
                    small
                    depressed
                    class="item-treeview-dl-btn"
                    :disabled="isComputing"
                    @click="$refs.imageDownloadModal.downloadSVG('unipept_treeview', '#ec-treeview svg')">
                    <v-icon>mdi-download</v-icon>
                    Save as image
                </v-btn>
                <treeview
                    id="ec-treeview"
                    :loading="isComputing"
                    :data="ecTree"
                    :autoResize="true"
                    :height="300"
                    :width="800"
                    :tooltip="ecTreeTooltip"
                    :enableAutoExpand="true">
                </treeview>
            </v-card>
            <image-download-modal ref="imageDownloadModal"></image-download-modal>
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
import ImageDownloadModal from "@/components/utils/ImageDownloadModal.vue";
import { CountTable, Ontology } from "@/business";
import TreeViewNode from "@/components/visualizations/TreeViewNode";

@Component({
    components: { AmountTable, Treeview, ImageDownloadModal }
})
export default class SingleEcSummaryCard extends Vue {
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

    private itemRetriever: AmountTableItemRetriever<EcCode, EcDefinition>;
    private ecTree: TreeViewNode = null;

    private trust: FunctionalTrust = null;
    private trustLine: string = "";
    private isComputing: boolean = false;

    private mounted() {
        this.onInputsChanged();
    }

    @Watch("peptide")
    @Watch("equateIl")
    private async onInputsChanged() {
        if (this.peptide) {
            this.isComputing = true;

            const ecProteinProcessor = new EcProteinCountTableProcessor(
                this.peptide,
                this.equateIl,
                this.communicationSource
            );

            const functionalCountTable = await ecProteinProcessor.getCountTable();

            const ontologyProcessor = new EcOntologyProcessor(this.communicationSource);
            const ontology = await ontologyProcessor.getOntology(functionalCountTable);

            this.trust = await ecProteinProcessor.getTrust();
            this.trustLine = FunctionalUtils.computeTrustLine(this.trust, "EC-number", "protein");

            this.itemRetriever = new SingleAmountTableItemRetriever(
                functionalCountTable,
                ontology,
                this.trust.totalAmountOfItems
            );

            this.ecTree = await this.computeEcTree(functionalCountTable, ontology);

            this.isComputing = false;
        }
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
                    <strong>${d.data.count} peptides</strong> have at least one EC number within ${fullCode},<br>`;

        if (d.data.self_count == 0) {
            tip += "no specific annotations";
        } else {
            if (d.data.self_count == d.data.count) {
                tip += " <strong>all specifically</strong> for this number";
            } else {
                tip += ` <strong>${d.data.self_count} specifically</strong> for this number`;
            }
        }

        tip += "</div>";
        return tip;
    }

    private async computeEcTree(
        ecCountTable: CountTable<EcCode>,
        ecOntology: Ontology<EcCode, EcDefinition>
    ): Promise<TreeViewNode> {
        const codeNodeMap = new Map<EcCode, TreeViewNode>();

        codeNodeMap.set("-.-.-.-", {
            id: 0,
            name: "-.-.-.-",
            children: [],
            data: {
                self_count: 0,
                count: 0,
                data: {
                    sequences: Object.create(null),
                    self_sequences: Object.create(null),
                },
            },
        });

        const getOrNew = (key) => {
            if (!codeNodeMap.has(key)) {
                codeNodeMap.set(key, {
                    id: key.split(".").map((x) => ("0000" + x).slice(-4)).join("."),
                    name: key.split(".").filter((x) => x !== "-").join("."),
                    children: [],
                    data: {
                        self_count: 0,
                        count: 0,
                        data: {
                            code: key,
                            value: 0,
                            sequences: Object.create(null),
                            self_sequences: Object.create(null),
                        }
                    },
                });
                const ancestors = EcDefinition.computeAncestors(key, true);
                getOrNew(ancestors[0]).children.push(codeNodeMap.get(key));
            }
            return codeNodeMap.get(key);
        };

        const sortedEcs = ecCountTable.getOntologyIds()
            .map(id => ecOntology.getDefinition(id))
            // Only retain valid definitions
            .filter(def => def)
            .sort((a: EcDefinition, b: EcDefinition) => a.level - b.level);

        for (const ecDef of sortedEcs) {
            const toInsert = {
                id: ecDef.code.split(".").map((x) => ("0000" + x).slice(-4)).join("."),
                name: ecDef.code.split(".").filter((x) => x !== "-").join("."),
                children: [],
                data: {
                    self_count: ecCountTable.getCounts(ecDef.code),
                    count: ecCountTable.getCounts(ecDef.code),
                    data: ecDef,
                },
            };

            codeNodeMap.set(ecDef.code, toInsert);

            const ancestors = EcDefinition.computeAncestors(ecDef.code, true);
            getOrNew(ancestors[0]).children.push(toInsert);
            for (const a of ancestors) {
                getOrNew(a).data.count += toInsert.data.count;
            }
        }

        // Order the nodes by their id (order by EC number)
        for (const val of codeNodeMap.values()) {
            val.children.sort((a, b) => a.id.localeCompare(b.id));
        }

        return codeNodeMap.get("-.-.-.-");
    }
}
</script>

<style scoped>

</style>
