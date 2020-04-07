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
            show-expand>
            <template v-slot:item.uniprotAccessionId="{ item }">
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn color="white" v-on="on">
                            <span style="width: 80px">
                                {{ item.uniprotAccessionId }}
                            </span>
                            <v-icon>mdi-chevron-down</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="openInUniProt(item.uniprotAccessionId)">
                            <v-list-item-title>UniProt</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openInPride(item.uniprotAccessionId)">
                            <v-list-item-title>PRIDE</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openInPeptideAtlas(item.uniprotAccessionId)">
                            <v-list-item-title>PeptideAtlas</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <template v-slot:item.functionalAnnotations="{ item }">
                <functional-annotations-tooltip :annotations="item.functionalAnnotations">
                </functional-annotations-tooltip>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length" style="padding-top: 12px; padding-bottom: 12px;">
                    <v-list
                        two-line
                        subheader
                        dense
                        disabled>
                        <v-subheader>Enzyme Commission numbers</v-subheader>
                        <v-list-item-group>
                            <v-list-item v-for="definition of item.functionalAnnotations.ec" :key="definition.code">
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ definition.code.substr(3) }} - {{ definition.name }} - {{ definition.namespace }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        Assigned to x of x matched proteins with an EC annotation.
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                        <v-subheader>Gene Ontology terms</v-subheader>
                        <v-list-item-group>
                            <v-list-item v-for="definition of item.functionalAnnotations.go" :key="definition.code">
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ definition.code }} - {{ definition.name }} - {{ definition.namespace }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        Assigned to x of x matched proteins with a GO annotation.
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                        <v-subheader>InterPro entries</v-subheader>
                        <v-list-item-group>
                            <v-list-item v-for="definition of item.functionalAnnotations.go" :key="definition.code">
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ definition.code.substr(4) }} - {{ definition.name }} - {{ definition.namespace }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        Assigned to x of x matched proteins with an InterPro annotation.
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
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

type MatchedProtein = {
    uniprotAccessionId: UniprotAccessionId,
    name: string,
    organism: string,
    functionalAnnotations: {
        go: GoDefinition[],
        ec: EcDefinition[],
        interpro: InterproDefinition[]
    }
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

    private headers = [
        {
            text: "UniProt ID",
            align: "start",
            value: "uniprotAccessionId",
            width: "15%"
        },
        {
            text: "Name",
            align: "start",
            value: "name",
            width: "40%"
        },
        {
            text: "Organism",
            align: "start",
            value: "organism",
            width: "40%"
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

    private mounted() {
        this.onInputsChanged();
    }

    private filterByValue(value, search, item) {
        if (!item || !search) {
            return true;
        }

        // TODO: This might need some optimizing if it turns out to be slow for large sets of proteins.
        return JSON.stringify(item).toLowerCase().indexOf(search.toLowerCase()) >= 0;
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

            const ecOntologyProcessor = new EcOntologyProcessor();
            const goOntologyProcessor = new GoOntologyProcessor();
            const interproOntologyProcessor = new InterproOntologyProcessor();
            const ncbiOntologyProcessor = new NcbiOntologyProcessor();

            const ecOntology = await ecOntologyProcessor.getOntologyByIds(ecNumbers);
            const goOntology = await goOntologyProcessor.getOntologyByIds(goTerms);
            const interproOntology = await interproOntologyProcessor.getOntologyByIds(interproEntries);
            const ncbiOntology = await ncbiOntologyProcessor.getOntologyByIds(organisms);

            this.items.length = 0;
            this.items.push(...proteins.map(p => {
                const organism = ncbiOntology.getDefinition(p.organism);
                return {
                    uniprotAccessionId: p.uniprotAccessionId,
                    name: p.name,
                    organism: organism ? organism.name : "",
                    functionalAnnotations: {
                        go: p.goTerms.map(term => goOntology.getDefinition(term)),
                        ec: p.ecNumbers.map(n => ecOntology.getDefinition("EC:" + n)),
                        interpro: p.interproEntries.map(i => interproOntology.getDefinition("IPR:" + i))
                    }
                }
            }));

            this.loading = false;
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
}
</script>

<style scoped>
    .annotation-secondary-title {
        font-weight: bold;
    }

    .annotation-list {
        list-style-type: none;
    }
</style>
