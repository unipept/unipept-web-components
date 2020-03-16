import { NCBITaxonomy } from "./taxa/NCBITaxonomy"
import { GeneOntology } from "./go/GeneOntology"
import { ECOntology } from "./ec/ECOntology"
import { InterproOntology } from "./interpro/InterproOntology"

export namespace Ontologies
{
    export const ecOntology = new ECOntology()
    export const geneOntology = new GeneOntology()
    export const interproOntology = new InterproOntology()
    export const ncbiTaxonomy = new NCBITaxonomy()
}
