import { CountTable } from "./../counts/CountTable";
import { OntologyIdType } from "../ontology/Ontology";

export default interface CountTableProcessor<OntologyId extends OntologyIdType> {
    getCountTable(): Promise<CountTable<OntologyId>>;
}
