<docs>
    The MatchedProteinsTable is a component that displays a list of all proteins that are associated with a given
    peptide. This table shows the UniProt ID's, protein name, organism in which the protein occurs and all associated
    functional annotations.
</docs>

<template>
    <v-card>
        <v-card-title>
            <v-text-field v-model="filter" append-icon="search" label="Filter" single-line hide-details>
            </v-text-field>
        </v-card-title>
        <v-data-table
            :headers="headers"
            :items="items"
            item-key="uniprotAccessionId"
            :search="filter"
            :custom-filter="filterByValue"
            :expanded.sync="expanded"
            :loading="loading"
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
                <v-tooltip top>
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

                <v-tooltip top>
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

                <v-tooltip top>
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
                                        Assigned to {{ peptideData.fa.data[definition.code] }} of
                                        {{ peptideData.fa.counts.EC }} matched proteins with an EC annotation
                                        ({{ percentageForAnnotation(definition.code, "EC") }}).
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
                                        Assigned to {{ peptideData.fa.data[definition.code] }} of
                                        {{ peptideData.fa.counts.GO }} matched proteins with a GO annotation
                                        ({{ percentageForAnnotation(definition.code, "GO") }}).
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
                                        Assigned to {{ peptideData.fa.data[definition.code] }} of
                                        {{ peptideData.fa.counts.IPR }} matched proteins with an InterPro annotation
                                        ({{ percentageForAnnotation(definition.code, "IPR") }}).
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
import { NcbiId } from "./../../business/ontology/taxonomic/ncbi/NcbiTaxon";
import NcbiOntologyProcessor from "./../../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import NetworkUtils from "./../../business/communication/NetworkUtils";
import Pept2DataCommunicator from "./../../business/communication/peptides/Pept2DataCommunicator";
import SearchConfiguration from "./../../business/configuration/SearchConfiguration";
import { PeptideDataResponse } from "./../../business/communication/peptides/PeptideDataResponse";
import { CountTable } from "./../../business/counts/CountTable";
import StringUtils from "./../../business/misc/StringUtils";
import { OntologyIdType } from "./../../business/ontology/Ontology";
import CommunicationSource from "./../../business/communication/source/CommunicationSource";

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
    /**
     * The peptide that's being looked up by the user and for which all associated proteins should be displayed.
     */
    @Prop({ required: true })
    private peptide: Peptide;
    @Prop({ required: true })
    private equateIl: boolean;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

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

    private items: MatchedProtein[] = [];
    private loading: boolean = false;

    private filter: string = "";
    private peptideData: PeptideDataResponse;

    private expanded = [];

    private mounted() {
        this.onInputsChanged();
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

    @Watch("peptide")
    @Watch("equateIl")
    private async onInputsChanged() {
        if (this.peptide) {
            this.loading = true;
            const proteinProcessor = new ProteinProcessor();
            const proteins = await proteinProcessor.getProteinsByPeptide(this.peptide, this.equateIl);

            const [ecNumbers, goTerms, interproEntries, organisms] = proteins.reduce((acc: [EcCode[], GoCode[], InterproCode[], NcbiId[]], current: ProteinDefinition) => {
                acc[0].push(...current.ecNumbers.map(e => "EC:" + e));
                acc[1].push(...current.goTerms);
                acc[2].push(...current.interproEntries.map(e => "IPR:" + e));
                acc[3].push(current.organism);
                return acc;
            }, [[], [], [], []]);

            const searchConfig = new SearchConfiguration(this.equateIl, false, false);

            await Pept2DataCommunicator.process(new CountTable<Peptide>(new Map([[this.peptide, 1]])), searchConfig)
            this.peptideData = Pept2DataCommunicator.getPeptideResponse(
                this.peptide,
                searchConfig
            );

            const ecOntologyProcessor = new EcOntologyProcessor(this.communicationSource);
            const goOntologyProcessor = new GoOntologyProcessor(this.communicationSource);
            const interproOntologyProcessor = new InterproOntologyProcessor(this.communicationSource);
            const ncbiOntologyProcessor = new NcbiOntologyProcessor(this.communicationSource);

            const ecOntology = await ecOntologyProcessor.getOntologyByIds(ecNumbers);
            const goOntology = await goOntologyProcessor.getOntologyByIds(goTerms);
            const interproOntology = await interproOntologyProcessor.getOntologyByIds(interproEntries);
            const ncbiOntology = await ncbiOntologyProcessor.getOntologyByIds(organisms);

            this.items.length = 0;
            this.items.push(...proteins.map(p => {
                const organism = ncbiOntology.getDefinition(p.organism);

                const goTerms = p.goTerms.map(term => goOntology.getDefinition(term)).filter(e => e);
                const ecTerms = p.ecNumbers.map(n => ecOntology.getDefinition("EC:" + n)).filter(e => e);
                const iprTerms = p.interproEntries.map(i => interproOntology.getDefinition("IPR:" + i)).filter(e => e);

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
            }));

            this.loading = false;
        }
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
    private percentageForAnnotation(annotationCode: OntologyIdType, annotationType: ("GO" | "EC" | "IPR")) {
        return StringUtils.numberToPercent(
            this.peptideData.fa.data[annotationCode] / this.peptideData.fa.counts[annotationType]
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
