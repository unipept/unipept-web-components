<template>
    <v-card flat>
        <v-card-text>
            <div v-if="!isComputing">
                <filter-functional-annotations-dropdown v-model="percentSettings">
                </filter-functional-annotations-dropdown>
                <span>This panel shows the Enzyme Commission numbers that were matched to your peptides. </span>
                <span v-html="trustLine"></span>
                <span>Click on a row in the table to see a taxonomy tree that highlights occurrences.</span>
            </div>
            <amount-table
                annotation-name="EC-number"
                :item-retriever="itemRetriever"
                :external-url-constructor="getUrl"
                :loading="isComputing || ecOntology === undefined || ecCountTableProcessor === undefined"
                :items-to-peptides="itemsToPeptides"
                :taxa-to-peptides="taxaToPeptides"
                :tree="tree"
                :item-to-csv-summary="saveSummaryAsCsv"
                :show-percentage="showPercentage">
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
                    :tooltip-text="ecTreeTooltip">
                </treeview>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import FilterFunctionalAnnotationsDropdown from "./../functional/FilterFunctionalAnnotationsDropdown.vue";
import { Prop, Watch } from "vue-property-decorator";
import { FunctionalUtils } from "./../functional/FunctionalUtils";

import {
    CountTable,
    EcCode,
    EcDefinition,
    FunctionalCountTableProcessor,
    EcCountTableProcessor,
    FunctionalTrust,
    ProteomicsAssay,
    Peptide,
    Ontology,
    Tree,
    Pept2DataCommunicator,
    NcbiOntologyProcessor,
    NcbiId,
    PeptideCountTableProcessor,
    FunctionalSummaryProcessor,
    NetworkUtils,
    CsvUtils, TreeNode
} from "@/business";

import MultiAmountTableItemRetriever from "@/components/analysis/multi/MultiAmountTableItemRetriever";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import LcaCountTableProcessor from "@/business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import CommunicationSource from "@/business/communication/source/CommunicationSource";
import Treeview from "@/components/visualizations/Treeview.vue";
import AmountTable from "@/components/tables/AmountTable.vue";
import { DataNodeLike } from "unipept-visualizations";

@Component({
    components: { FilterFunctionalAnnotationsDropdown, Treeview, AmountTable }
})
export default class MultiEcSummaryCard extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: false, default: false })
    private showPercentage: boolean;

    private itemRetriever: AmountTableItemRetriever<EcCode, EcDefinition> = null;
    private itemsToPeptides: Map<EcCode, Peptide[]> = null;
    private taxaToPeptides: Map<NcbiId, Peptide[]> = null;
    private ecTree: DataNodeLike = null;

    private trust: FunctionalTrust = null;
    private trustLine: string = "";
    private percentSettings: string = "5";

    private isComputing: boolean = false;

    get ecCountTableProcessor(): EcCountTableProcessor {
        return this.$store.getters["ec/filteredData"](this.assay)?.processor;
    }

    get peptideCountTable(): CountTable<Peptide> {
        return this.$store.getters.assayData(this.assay)?.filteredPeptideCountTable;
    }

    get ecOntology(): Ontology<EcCode, EcDefinition> {
        return this.$store.getters["ec/ontology"](this.assay);
    }

    get tree(): Tree {
        return this.$store.getters["ncbi/tree"](this.assay);
    }

    get ncbiCountTableProcessor(): LcaCountTableProcessor {
        return this.$store.getters["ncbi/originalData"](this.assay)?.processor;
    }

    get filterPercentage(): number {
        return this.$store.getters.assayData(this.assay)?.filterPercentage;
    }

    get communicationSource(): CommunicationSource {
        return this.$store.getters.assayData(this.assay)?.communicationSource;
    }

    get pept2DataCommunicator(): Pept2DataCommunicator {
        return this.$store.getters.assayData(this.assay)?.pept2dataCommunicator;
    }

    get ncbiOntologyProcessor(): NcbiOntologyProcessor {
        return this.$store.getters["ncbi/ontology"](this.assay)?.processor;
    }

    private mounted() {
        this.onNcbiCountTableChanged();
        this.recompute();
    }

    @Watch("ncbiCountTableProcessor")
    private async onNcbiCountTableChanged() {
        if (this.ncbiCountTableProcessor) {
            this.taxaToPeptides = await this.ncbiCountTableProcessor.getAnnotationPeptideMapping();
        }
    }

    @Watch("ecCountTableProcessor")
    @Watch("peptideCountTable")
    @Watch("ecOntology")
    @Watch("filterPercentage")
    private async recompute() {
        this.isComputing = true;
        this.itemRetriever = null;

        if (this.peptideCountTable && this.ecCountTableProcessor && this.ecOntology) {
            this.trust = await this.ecCountTableProcessor.getTrust();
            this.trustLine = FunctionalUtils.computeTrustLine(
                this.trust,
                "EC number",
                "peptide"
            );

            let ecCountTable: CountTable<EcCode>;

            if (this.filterPercentage === FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE) {
                ecCountTable = await this.ecCountTableProcessor.getCountTable();
                this.itemsToPeptides = await this.ecCountTableProcessor.getAnnotationPeptideMapping();
            } else {
                const ecProcessor = new EcCountTableProcessor(
                    this.peptideCountTable,
                    this.assay.getSearchConfiguration(),
                    this.communicationSource,
                    this.filterPercentage
                );

                ecCountTable = await ecProcessor.getCountTable();
                this.itemsToPeptides = await ecProcessor.getAnnotationPeptideMapping();
            }

            this.ecTree = await this.computeEcTree(ecCountTable, this.ecOntology);

            this.itemRetriever = new MultiAmountTableItemRetriever(
                ecCountTable,
                this.peptideCountTable,
                this.ecOntology
            );
        }

        this.isComputing = false;
    }

    private getUrl(code: string): string {
        return `https://www.uniprot.org/uniprot/?query=${code}`
    }

    private async saveSummaryAsCsv(code: EcCode): Promise<void> {
        const peptideTableProcessor = new PeptideCountTableProcessor();
        const peptideCounts = await peptideTableProcessor.getPeptideCountTable(
            this.itemsToPeptides.get(code),
            this.assay.getSearchConfiguration()
        );

        const functionalSummaryProcessor = new FunctionalSummaryProcessor();
        const data = await functionalSummaryProcessor.summarizeFunctionalAnnotation(
            this.ecOntology.getDefinition(code),
            peptideCounts,
            this.assay.getSearchConfiguration(),
            this.pept2DataCommunicator,
            this.ncbiOntologyProcessor
        );

        await NetworkUtils.downloadDataByForm(
            CsvUtils.toCsvString(data),
            code.replace(/:/g, "_") + ".csv",
            "text/csv"
        );
    }

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

    private async computeEcTree(
        ecCountTable: CountTable<EcCode>,
        ecOntology: Ontology<EcCode, EcDefinition>
    ): Promise<DataNodeLike> {
        const codeNodeMap = new Map<EcCode, DataNodeLike>();

        codeNodeMap.set(
            "-.-.-.-",
            {
                name: "-.-.-.-",
                count: 0,
                selfCount: 0,
                children: [],
                extra: {
                    sequences: Object.create(null),
                    self_sequences: Object.create(null),
                    id: 0
                }
            }
        );

        const getOrNew = (key) => {
            if (!codeNodeMap.has(key)) {
                codeNodeMap.set(
                    key,
                    {
                        name: key.split(".").filter((x) => x !== "-").join("."),
                        count: 0,
                        selfCount: 0,
                        children: [],
                        extra: {
                            code: key,
                            value: 0,
                            sequences: Object.create(null),
                            self_sequences: Object.create(null),
                            id: key.split(".").map((x) => ("0000" + x).slice(-4)).join(".")
                        }
                    }
                );

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
                name: ecDef.code.split(".").filter((x) => x !== "-").join("."),
                count: ecCountTable.getCounts(ecDef.code),
                selfCount: ecCountTable.getCounts(ecDef.code),
                children: [],
                extra: {
                    definition: ecDef,
                    id: ecDef.code.split(".").map((x) => ("0000" + x).slice(-4)).join(".")
                },
            };

            codeNodeMap.set(ecDef.code, toInsert);

            const ancestors = EcDefinition.computeAncestors(ecDef.code, true);
            getOrNew(ancestors[0]).children.push(toInsert);
            for (const a of ancestors) {
                getOrNew(a).count += toInsert.count;
            }
        }

        // Order the nodes by their id (order by EC number)
        for (const val of codeNodeMap.values()) {
            val.children.sort((a, b) => a.extra.id.localeCompare(b.extra.id));
        }

        return codeNodeMap.get("-.-.-.-");
    }
}
</script>

<style scoped>

</style>
