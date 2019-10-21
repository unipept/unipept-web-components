import { CountTable } from "./CountTable";
import { ECOntology } from "../ontology/ec/ECOntology";
import { Ontologies } from "../ontology/Ontologies";

export class ECCountTable extends CountTable<ECOntology, string> {
    getOntology(): ECOntology {
        return Ontologies.ecOntology;
    }
}
