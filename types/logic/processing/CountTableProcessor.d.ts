import OntologyCode from "../ontology/OntologyCode";
import CountTable from "./CountTable";
export default interface CountTableProcessor<OntologyId extends OntologyCode> {
    getCountTable(): CountTable<OntologyId>;
}
