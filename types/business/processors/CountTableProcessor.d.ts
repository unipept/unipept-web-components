import { CountTable } from "./../counts/CountTable";
import { OntologyIdType } from "../ontology/Ontology";
import Cancellable from "../progress/Cancellable";
export default interface CountTableProcessor<OntologyId extends OntologyIdType> extends Cancellable {
    getCountTable(): CountTable<OntologyId>;
}
