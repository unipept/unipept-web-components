<template>
    <v-card flat>
        <v-card-text>
            <div v-if="!analysisInProgress">
                <span class="placeholder-text">
                    Please select at least one dataset for analysis.
                </span>
            </div>
            <div v-else-if="loading">
                <span class="ec-waiting">
                    <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                </span>
            </div>
            <div v-else>
                <slot name="analysis-header"></slot>

                <ec-amount-table
                    :loading="isLoading"
                    :ec-count-table="ecCountTable"
                    :ec-peptide-mapping="ecPeptideMapping"
                    :ec-ontology="ecOntology"
                    :search-configuration="searchConfiguration"
                    :relative-counts="relativeCounts"
                    :tree="tree"
                    :taxa-to-peptides-mapping="taxaToPeptidesMapping"
                    :show-percentage="showPercentage">
                </ec-amount-table>
                <v-card outlined v-if="ecTree">
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
                        :tooltip="ecTreeTooltip"
                        :enableAutoExpand="true">
                    </treeview>
                </v-card>
                <image-download-modal ref="imageDownloadModal"></image-download-modal>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import FunctionalSummaryMixin from "./FunctionalSummaryMixin.vue";
import Component, { mixins } from "vue-class-component";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";
import EcAmountTable from "../../tables/EcAmountTable.vue";
import TreeViewNode from "../../visualizations/TreeViewNode";
import Treeview from "../../visualizations/Treeview.vue";
import { Prop, Watch } from "vue-property-decorator";
import EcDefinition, { EcCode } from "./../../../business/ontology/functional/ec/EcDefinition";
import { CountTable } from "./../../../business/counts/CountTable";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import SearchConfiguration from "./../../../business/configuration/SearchConfiguration";
import EcCountTableProcessor from "./../../../business/processors/functional/ec/EcCountTableProcessor";
import { Ontology } from "./../../../business/ontology/Ontology";
import EcOntologyProcessor from "./../../../business/ontology/functional/ec/EcOntologyProcessor";
import { NcbiId } from "./../../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../../business/ontology/taxonomic/Tree";
import ImageDownloadModal from "./../../utils/ImageDownloadModal.vue";

@Component({
    components: {
        ImageDownloadModal,
        FilterFunctionalAnnotationsDropdown,
        EcAmountTable,
        Treeview
    },
    computed: {
        isLoading: {
            get(): boolean {
                return this.calculationsInProgress || this.loading;
            }
        }
    }
})
export default class EcSummaryCard extends Vue {
    @Prop({ required: true })
    private ecCountTable: CountTable<Peptide>;
    @Prop({ required: true })
    private ecOntology: Ontology<EcCode, EcDefinition>;
    @Prop({ required: false })
    private ecPeptideMapping: Map<EcCode, Peptide[]>;
    @Prop({ required: false })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: false, default: true })
    private analysisInProgress: boolean;
    @Prop({ required: true })
    private relativeCounts: number;
    @Prop({ required: false, default: false })
    private showPercentage: boolean;
    @Prop({ required: false })
    protected taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;
    @Prop({ required: false })
    protected tree: Tree;

    private calculationsInProgress: boolean = false;
    private ecTree: TreeViewNode = null;

    public async mounted() {
        await this.recompute();
    }

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
    };

    @Watch("ecCountTable")
    @Watch("ecOntology")
    private async recompute() {
        this.calculationsInProgress = true;
        if (this.ecCountTable && this.ecOntology) {
            this.ecTree = await this.computeEcTree(this.ecCountTable, this.ecOntology);
        }
        this.calculationsInProgress = false;
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

<style>
    .ec-waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
    }
</style>
