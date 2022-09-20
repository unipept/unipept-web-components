import { Peptide } from "./../ontology/raw/Peptide";
import CountTableProcessor from "./CountTableProcessor";
import { OntologyIdType } from "../ontology/Ontology";
export default interface ProteomicsCountTableProcessor<OntologyId extends OntologyIdType> extends CountTableProcessor<OntologyId> {
    getAnnotationPeptideMapping(): Map<OntologyId, Peptide[]>;
}