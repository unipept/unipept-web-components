<docs>
    The MatchedProteinsTable is a component that displays a list of all proteins that are associated with a given
    peptide. This table shows the UniProt ID's, protein name, organism in which the protein occurs and all associated
    functional annotations.
</docs>

<template>
    <div>
        <p>DIT IS DE TITEL!!</p>
        <v-data-table
            :headers="headers"
            :items="items"
            item-key="uniprotAccessionId">
            <template v-slot:item.uniprotAccessionId="{ item }">
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn color="white" v-on="on">
                            {{ item.uniprotAccessionId }}
                            <v-icon>mdi-chevron-down</v-icon>
                        </v-btn>
                    </template>
                </v-menu>
            </template>
        </v-data-table>
    </div>
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
            filterable: false,
            value: "uniprotAccessionId"
        },
        {
            text: "Name",
            align: "start",
            filterable: true,
            value: "name"
        },
        {
            text: "Organism",
            align: "start",
            filterable: true,
            value: "organism"
        },
        {
            text: "Functional annotations",
            align: "start",
            filterable: true,
            value: "functionalAnnotations"
        }
    ];

    private items: MatchedProtein[] = [];
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
            const proteins = await proteinProcessor.getProteinsByPeptide(this.peptide, this.equateIl);

            const [ecNumbers, goTerms, interproEntries, organisms] = proteins.reduce((acc: [EcCode[], GoCode[], InterproCode[], NcbiId[]], current: ProteinDefinition) => {
                acc[0].push(...current.ecNumbers);
                acc[1].push(...current.goTerms);
                acc[2].push(...current.interproEntries);
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
                        ec: p.ecNumbers.map(n => ecOntology.getDefinition(n)),
                        interpro: p.interproEntries.map(i => interproOntology.getDefinition(i))
                    }
                }
            }));

            this.loading = false;
        }
    }
}
</script>

<style scoped>

</style>
