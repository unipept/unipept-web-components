import { CountTable } from "./../counts/CountTable";
import { Peptide } from "./../ontology/raw/Peptide";
import CountTableProcessor from "./CountTableProcessor";
import { OntologyIdType } from "../ontology/Ontology";

export default interface ProteomicsCountTableProcessor<OntologyId extends OntologyIdType> extends CountTableProcessor<OntologyId> {
    getAnnotationPeptideMapping(): Promise<Map<OntologyId, Peptide[]>>;
}
