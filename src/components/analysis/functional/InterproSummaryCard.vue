<template>
    <v-card flat>
        <v-card-text>
            <div v-if="!peptideCountTable">
                <span class="waiting" v-if="isLoading">
                    <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
                </span>
                <span v-else class="placeholder-text">
                    Please select at least one dataset for analysis.
                </span>
            </div>
            <div v-else>
                <filter-functional-annotations-dropdown v-model="percentSettings">
                </filter-functional-annotations-dropdown>
                <span>This panel shows the Interpro entries that were matched to your peptides. </span>
                <span v-html="interproTrustLine"></span>
                <span>Click on a row in a table to see a taxonomy tree that highlights occurrences.</span>
                <v-select :items="namespaceValues" label="Category" v-model="selectedNamespace"></v-select>
                <interpro-amount-table
                    v-if="selectedItem"
                    :loading="isLoading"
                    :interpro-count-table="selectedItem.countTable"
                    :interpro-peptide-mapping="selectedItem.peptideMapping"
                    :interpro-ontology="selectedItem.ontology"
                    :relative-counts="relativeCounts"
                    :search-configuration="searchConfiguration"
                    :show-percentage="showPercentage">
                </interpro-amount-table>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import FunctionalSummaryMixin from "./FunctionalSummaryMixin.vue";
import InterproAmountTable from "./../../tables/InterproAmountTable.vue";
import FilterFunctionalAnnotationsDropdown from "./FilterFunctionalAnnotationsDropdown.vue";
import SearchConfiguration from "./../../../business/configuration/SearchConfiguration";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { CountTable } from "./../../../business/counts/CountTable";
import {
    convertStringToInterproNamespace,
    InterproNamespace
} from "./../../../business/ontology/functional/interpro/InterproNamespace";
import InterproDefinition, { InterproCode } from "./../../../business/ontology/functional/interpro/InterproDefinition";
import { Ontology } from "./../../../business/ontology/Ontology";
import InterproCountTableProcessor from "./../../../business/processors/functional/interpro/InterproCountTableProcessor";
import InterproOntologyProcessor from "./../../../business/ontology/functional/interpro/InterproOntologyProcessor";
import StringUtils from "./../../../business/misc/StringUtils";

@Component({
    components: {
        InterproAmountTable,
        FilterFunctionalAnnotationsDropdown
    },
    computed: {
        selectedItem: {
            get(): {
                countTable: CountTable<InterproCode>,
                peptideMapping: Map<InterproCode, Peptide[]>,
                definitions: InterproDefinition[],
                title: string,
                ontology: Ontology<InterproCode, InterproDefinition>
                } {
                const i = this.namespaceValues.indexOf(this.selectedNamespace);
                return this.items[i];
            }
        },
        isLoading: {
            get(): boolean {
                return this.calculationsInProgress || this.loading;
            }
        }
    }
})
export default class InterproSummaryCard extends mixins(FunctionalSummaryMixin) {
    @Prop({ required: true })
    private peptideCountTable: CountTable<Peptide>;
    @Prop({ required: true })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: true })
    private relativeCounts: number;
    @Prop( { required: false, default: false })
    private showPercentage: boolean;

    private namespaceValues: string[] = ["all"].concat(Object.values(InterproNamespace));
    private selectedNamespace: string = "all";
    private items: {
        countTable: CountTable<InterproCode>,
        peptideMapping: Map<InterproCode, Peptide[]>,
        definitions: InterproDefinition[],
        title: string,
        ontology: Ontology<InterproCode, InterproDefinition>
    }[] = [];

    private interproTrustLine: string = "";
    private calculationsInProgress: boolean = false;

    mounted() {
        for (let ns of this.namespaceValues) {
            this.items.push({
                countTable: undefined,
                peptideMapping: undefined,
                definitions: [],
                title: StringUtils.stringTitleize(ns.toString()),
                ontology: undefined
            });
        }

        this.recompute();
    }

    @Watch("selectedNamespace")
    private async onNamespaceChanged() {
        await this.recompute();
    }

    @Watch("peptideCountTable")
    @Watch("searchConfiguration")
    public async recompute(): Promise<void> {
        this.calculationsInProgress = true;
        if (this.peptideCountTable && this.searchConfiguration) {
            const percentage = parseInt(this.percentSettings);
            const interproProcessor = new InterproCountTableProcessor(
                this.peptideCountTable,
                this.searchConfiguration,
                percentage
            );

            for (let i = 0; i < this.namespaceValues.length; i++) {
                const namespace: InterproNamespace = convertStringToInterproNamespace(this.namespaceValues[i]);

                this.items[i].countTable = await interproProcessor.getCountTable(namespace);
                this.items[i].peptideMapping = await interproProcessor.getAnnotationPeptideMapping();

                const ontologyProcessor = new InterproOntologyProcessor();
                this.items[i].ontology = await ontologyProcessor.getOntology(this.items[i].countTable);

                this.items[i].definitions.length = 0;
                this.items[i].definitions.push(
                    ...this.items[i].countTable.getOntologyIds().map(id => this.items[i].ontology.getDefinition(id))
                );
            }

            this.interproTrustLine = this.computeTrustLine(await interproProcessor.getTrust(), "Interpro-entries");
        }
        this.calculationsInProgress = false;
    }
}
</script>

<style lang="less">
    .waiting {
        margin-top: 16px;
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
    }
</style>
