<template>
    <amount-table
        :items="items"
        :loading="isLoading"
        :communication-source="communicationSource"
        annotation-name="GO term"
        :namespace="namespace"
        :search-configuration="searchConfiguration"
        :item-to-peptides-mapping="goPeptideMapping"
        :show-percentage="showPercentage"
        :tree="tree"
        :taxa-to-peptides-mapping="taxaToPeptidesMapping"
        :external-url-constructor="getUrl">
    </amount-table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { tooltipContent } from "../../components/visualizations/VisualizationHelper";
import Treeview from "../visualizations/treeview.vue";
import AmountTable from "./AmountTable.vue";
import GoDefinition, { GoCode } from "./../../business/ontology/functional/go/GoDefinition";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import TableItem from "./../tables/TableItem";
import GoOntologyProcessor from "./../../business/ontology/functional/go/GoOntologyProcessor";
import { Ontology } from "./../../business/ontology/Ontology";
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import Tree from "./../../business/ontology/taxonomic/Tree";
import CommunicationSource from "./../../business/communication/source/CommunicationSource";

@Component({
    components: {
        AmountTable
    },
    computed: {
        isLoading: {
            get(): boolean {
                return this.loading || this.isComputing;
            }
        }
    }
})
export default class GoAmountTable extends Vue {
    @Prop({ required: true })
    private goCountTable: CountTable<GoCode>;
    @Prop({ required: true })
    private goOntology: Ontology<GoCode, GoDefinition>;
    /**
     * The total amount of counts (over all GO-terms / peptides)
     */
    @Prop({ required: true })
    private relativeCounts: number;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

    @Prop({ required: false })
    private goPeptideMapping: Map<GoCode, Peptide[]>;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: false })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: false })
    private tree: Tree;
    @Prop({ required: false })
    protected taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;
    @Prop({ required: false })
    private namespace: string;
    /**
     * Whether the counts in the amount table should be displayed as absolute or relative (percentage) values.
     */
    @Prop({ required: false, default: false })
    private showPercentage: boolean;

    private items: TableItem[] = [];
    private isComputing: boolean = false;

    public async mounted() {
        await this.onInputsChanged();
    }

    @Watch("goCountTable")
    @Watch("relativeCounts")
    @Watch("goOntology")
    private onInputsChanged() {
        this.isComputing = true;
        this.items.length = 0;

        if (this.goCountTable && this.goOntology) {
            const newItems: TableItem[] = [];

            for (const goCode of this.goCountTable.getOntologyIds()) {
                const definition: GoDefinition = this.goOntology.getDefinition(goCode);
                const currentCount = this.goCountTable.getCounts(goCode);

                if (definition) {
                    newItems.push(new TableItem(
                        currentCount,
                        currentCount / this.relativeCounts,
                        definition.name,
                        definition.code,
                        definition
                    ));
                }
            }

            this.items.push(...newItems.sort((a: TableItem, b: TableItem) => b.count - a.count));
        }

        this.isComputing = false;
    }

    private getUrl(code: string): string {
        return `http://amigo.geneontology.org/amigo/search/ontology?q=${code}`;
    }
}
</script>

<style scoped>
</style>
