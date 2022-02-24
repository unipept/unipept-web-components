<template>
    <v-card>
        <v-card-title>
            <v-text-field v-model="filter" append-icon="mdi-magnify" label="Filter" single-line hide-details>
            </v-text-field>
        </v-card-title>
        <v-data-table
            :headers="headers"
            :items="items"
            item-key="uniprotAccessionId"
            :search="filter"
            :custom-filter="filterByValue"
            :expanded.sync="expanded"
            :loading="isAnalysisInProgress"
            show-expand>
            <template v-slot:item.uniprotAccessionId="{ item }" >
                <span @click="openInUniProt(item.uniprotAccessionId)" style="cursor: pointer;">
                    <span style="position: relative; top: 4px;">{{ item.uniprotAccessionId }}</span>
                    <v-btn icon small style="float: right;">
                        <v-icon small>mdi-open-in-new</v-icon>
                    </v-btn>
                </span>
            </template>
            <template v-slot:item.fa="{ item }">
                <v-tooltip top :open-delay="500">
                    <template v-slot:activator="{ on }">
                        <v-avatar v-on="on" size="30" :color="item.functionalAnnotations.ec.length > 0 ? 'indigo' : 'indigo lighten-4'">
                            <span class="white--text headline" style="font-size: 14px !important;">EC</span>
                        </v-avatar>
                    </template>
                    <span v-if="item.functionalAnnotations.ec.length >= 0">
                        This protein is annotated with
                        <span class="font-weight-bold" v-if="item.functionalAnnotations.ec.length === 1">
                            {{ item.functionalAnnotations.ec.length }} EC-number.
                        </span>
                        <span class="font-weight-bold" v-else>
                            {{ item.functionalAnnotations.ec.length }} EC-numbers.
                        </span>
                    </span>
                    <span v-else>
                        This protein is not annotated with EC-numbers.
                    </span>
                </v-tooltip>

                <v-tooltip top :open-delay="500">
                    <template v-slot:activator="{ on }">
                        <v-avatar v-on="on" size="30" :color="item.functionalAnnotations.go.length > 0 ? 'amber' : 'amber lighten-4'">
                            <span :class="[item.functionalAnnotations.go.length > 0 ? 'dark--text' : 'gray--text', 'headline']" style="font-size: 14px !important;">GO</span>
                        </v-avatar>
                    </template>
                    <span v-if="item.functionalAnnotations.go.length >= 0">
                        This protein is annotated with
                        <span class="font-weight-bold" v-if="item.functionalAnnotations.go.length === 1">
                            {{ item.functionalAnnotations.go.length }} GO-term.
                        </span>
                        <span class="font-weight-bold" v-else>
                            {{ item.functionalAnnotations.go.length }} GO-terms.
                        </span>
                    </span>
                    <span v-else>
                        This protein is not annotated with GO-terms.
                    </span>
                </v-tooltip>

                <v-tooltip top :open-delay="500">
                    <template v-slot:activator="{ on }">
                        <v-avatar v-on="on" size="30" :color="item.functionalAnnotations.interpro.length > 0 ? 'red' : 'red lighten-4'">
                            <span class="white--text headline" style="font-size: 14px !important;">IPR</span>
                        </v-avatar>
                    </template>
                    <span v-if="item.functionalAnnotations.interpro.length >= 0">
                        This protein is annotated with
                        <span class="font-weight-bold" v-if="item.functionalAnnotations.interpro.length === 1">
                            {{ item.functionalAnnotations.interpro.length }} InterPro-entries.
                        </span>
                        <span class="font-weight-bold" v-else>
                            {{ item.functionalAnnotations.interpro.length }} InterPro-entries.
                        </span>
                    </span>
                    <span v-else>
                        This protein is not annotated with InterPro-entries.
                    </span>
                </v-tooltip>
            </template>
            <template v-slot:item.data-table-expand="{ item }">
                <v-btn class="v-data-table__expand-icon" icon :disabled="item.totalAnnotations === 0" @click="toggleExpanded(item)">
                    <v-icon v-if="expanded.findIndex(i => i.uniprotAccessionId === item.uniprotAccessionId) !== -1">mdi-chevron-up</v-icon>
                    <v-icon v-else>mdi-chevron-down</v-icon>
                </v-btn>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length" style="padding-top: 12px; padding-bottom: 12px;">
                    <v-list
                        two-line
                        subheader
                        dense
                        disabled
                        v-if="peptideData">
                        <v-subheader v-if="item.functionalAnnotations.ec && item.functionalAnnotations.ec.length > 0">
                            Enzyme Commission numbers
                        </v-subheader>
                        <v-list-item-group
                            v-if="item.functionalAnnotations.ec && item.functionalAnnotations.ec.length > 0"
                            class="ec-list-group">
                            <v-list-item v-for="definition of item.functionalAnnotations.ec" :key="definition.code">
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ definition.code.substr(3) }} - {{ definition.name }} - {{ definition.namespace }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        Assigned to {{ peptideData.ec[definition.code] }} of
                                        {{ peptideData.faCounts.ec }} matched proteins with an EC annotation
                                        ({{ percentageForAnnotation(definition.code, "ec") }}).
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                        <v-subheader v-if="item.functionalAnnotations.go && item.functionalAnnotations.go.length > 0">
                            Gene Ontology terms
                        </v-subheader>
                        <v-list-item-group
                            v-if="item.functionalAnnotations.go && item.functionalAnnotations.go.length > 0"
                            class="go-list-group">
                            <v-list-item v-for="definition of item.functionalAnnotations.go" :key="definition.code">
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ definition.code }} - {{ definition.name }} - {{ definition.namespace }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        Assigned to {{ peptideData.go[definition.code] }} of
                                        {{ peptideData.faCounts.go }} matched proteins with a GO annotation
                                        ({{ percentageForAnnotation(definition.code, "go") }}).
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                        <v-subheader
                            v-if="item.functionalAnnotations.interpro && item.functionalAnnotations.interpro.length > 0">
                            InterPro entries
                        </v-subheader>
                        <v-list-item-group
                            v-if="item.functionalAnnotations.interpro && item.functionalAnnotations.interpro.length > 0"
                            class="interpro-list-group">
                            <v-list-item v-for="definition of item.functionalAnnotations.interpro" :key="definition.code">
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ definition.code.substr(4) }} - {{ definition.name }} - {{ definition.namespace }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        Assigned to {{ peptideData.ipr[definition.code] }} of
                                        {{ peptideData.faCounts.ipr }} matched proteins with an InterPro annotation
                                        ({{ percentageForAnnotation(definition.code, "ipr") }}).
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                    <div v-else class="no-peptide-data-alert">
                        <v-alert dense text type="error">
                            No data associated with the requested peptide was found!
                        </v-alert>
                    </div>
                </td>
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ProteinDefinition, { UniprotAccessionId } from "./../../business/ontology/protein/ProteinDefinition";
import GoDefinition, { GoCode } from "./../../business/ontology/functional/go/GoDefinition";
import EcDefinition, { EcCode } from "./../../business/ontology/functional/ec/EcDefinition";
import InterproDefinition, { InterproCode } from "./../../business/ontology/functional/interpro/InterproDefinition";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import { Prop, Watch } from "vue-property-decorator";
import ProteinProcessor from "./../../business/processors/protein/ProteinProcessor";
import EcOntologyProcessor from "./../../business/ontology/functional/ec/EcOntologyProcessor";
import GoOntologyProcessor from "./../../business/ontology/functional/go/GoOntologyProcessor";
import InterproOntologyProcessor from "./../../business/ontology/functional/interpro/InterproOntologyProcessor";
import NcbiTaxon, { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import NcbiOntologyProcessor from "./../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import NetworkUtils from "./../../business/communication/NetworkUtils";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import { CountTable } from "./../../business/counts/CountTable";
import StringUtils from "./../../business/misc/StringUtils";
import { Ontology, OntologyIdType } from "./../../business/ontology/Ontology";
import CommunicationSource from "./../../business/communication/source/CommunicationSource";
import PeptideData from "./../../business/communication/peptides/PeptideData";
import { ShareableMap } from "shared-memory-datastructures";

type MatchedProtein = {
    uniprotAccessionId: UniprotAccessionId,
    name: string,
    organism: string,
    functionalAnnotations: {
        go: GoDefinition[],
        ec: EcDefinition[],
        interpro: InterproDefinition[]
    },
    totalAnnotations: number
}
@Component
export default class MatchedProteinsTable extends Vue {
    private headers = [
        {
            text: "UniProt ID",
            align: "start",
            value: "uniprotAccessionId",
            width: "17%"
        },
        {
            text: "Name",
            align: "start",
            value: "name",
            width: "32%"
        },
        {
            text: "Organism",
            align: "start",
            value: "organism",
            width: "30%"
        },
        {
            text: "Annotations",
            align: "start",
            value: "fa",
            width: "16%",
            sortable: false
        },
        {
            text: "",
            value: "data-table-expand",
            width: "5%"
        },
    ];

    private filter: string = "";

    private expanded = [];

    get peptide(): Peptide {
        return this.$store.getters.peptideStatus.peptide;
    }

    get equateIl(): boolean {
        return this.$store.getters.peptideStatus.equateIl;
    }

    get peptideData(): PeptideData {
        return this.$store.getters.peptideStatus.peptideData;
    }

    get goOntology(): Ontology<GoCode, GoDefinition> {
        return this.$store.getters.peptideStatus.goOntology;
    }

    get ecOntology(): Ontology<EcCode, EcDefinition> {
        return this.$store.getters.peptideStatus.ecOntology;
    }

    get interproOntology(): Ontology<InterproCode, InterproDefinition> {
        return this.$store.getters.peptideStatus.interproOntology;
    }

    get ncbiOntology(): Ontology<NcbiId, NcbiTaxon> {
        return this.$store.getters.peptideStatus.ncbiOntology;
    }

    get isAnalysisInProgress(): boolean {
        return this.$store.getters.peptideStatus.analysisInProgress;
    }

    get proteinProcessor(): ProteinProcessor {
        return this.$store.getters.peptideStatus.proteinProcessor;
    }

    get items(): MatchedProtein[] {
        return this.proteinProcessor.getProteins().map(p => {
            const organism = this.ncbiOntology.getDefinition(p.organism);

            const goTerms = p.goTerms.map(term => this.goOntology.getDefinition(term)).filter(e => e);
            const ecTerms = p.ecNumbers.map(n => this.ecOntology.getDefinition("EC:" + n)).filter(e => e);
            const iprTerms = p.interproEntries.map(i => this.interproOntology.getDefinition("IPR:" + i)).filter(e => e);

            return {
                uniprotAccessionId: p.uniprotAccessionId,
                name: p.name,
                organism: organism ? organism.name : "",
                functionalAnnotations: {
                    go: goTerms,
                    ec: ecTerms,
                    interpro: iprTerms
                },
                totalAnnotations: goTerms.length + ecTerms.length + iprTerms.length
            }
        });
    }

    private filterByValue(value, search, item) {
        if (!item || !search) {
            return true;
        }

        return item.name.includes(search) ||
            item.uniprotAccessionId.includes(search) ||
            item.organism.includes(search) ||
            item.functionalAnnotations.go.some(e => e.name.includes(search) || e.code.includes(search)) ||
            item.functionalAnnotations.interpro.some(e => e.name.includes(search) || e.code.includes(search)) ||
            item.functionalAnnotations.ec.some(e => e.name.includes(search) || e.code.includes(search));
    }

    private toggleExpanded(item) {
        const idx: number = this.expanded.findIndex(i => i.uniprotAccessionId === item.uniprotAccessionId);
        if (idx >= 0) {
            this.expanded.splice(idx, 1);
        } else {
            this.expanded.push(item);
        }
    }

    private openInUniProt(accessionId: string): void {
        NetworkUtils.openInBrowser(`https://www.uniprot.org/uniprot/${accessionId}`);
    }

    private openInPride(accessionId: string): void {
        NetworkUtils.openInBrowser(
            `https://www.ebi.ac.uk/pride/searchSummary.do?queryTypeSelected=identification%20accession%20number&identificationAccessionNumber=${accessionId}`
        );
    }

    private openInPeptideAtlas(accessionId: string): void {
        NetworkUtils.openInBrowser(
            `https://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/Search?apply_action=GO&exact_match=exact_match%22&search_key=${accessionId}`
        )
    }

    /**
     * Returns how many of the total peptides of a specific annotation type (e.g. EC, GO or IPR) is annotated with a
     * concrete annotation (e.g. GO:005782).
     *
     * @param annotationCode The concrete annotation for which the annotation percentage should be computed.
     * @param annotationType The type of annotation that was given. Must be one of GO, EC, IPR.
     */
    private percentageForAnnotation(annotationCode: OntologyIdType, annotationType: ("go" | "ec" | "ipr")) {
        return StringUtils.numberToPercent(
            this.peptideData[annotationType][annotationCode] / this.peptideData.faCounts[annotationType]
        );
    }
}
</script>

<style scoped>
    .no-peptide-data-alert .v-alert {
        margin-bottom: 0 !important;
    }

    .gray--text {
        color: rgba(0, 0, 0, 0.2);
    }
</style>
