import { CountTable } from "./CountTable";
import { InterproOntology } from "../ontology/interpro/InterproOntology";
import { Ontologies } from "../ontology/Ontologies";

export class InterproCountTable extends CountTable<InterproOntology, string> {
    getOntology(): InterproOntology {
        return Ontologies.interproOntology;
    }
}
