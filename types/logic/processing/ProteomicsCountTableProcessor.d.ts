import { Peptide } from "../ontology";
import OntologyCode from "../ontology/OntologyCode";
import CountTableProcessor from "./CountTableProcessor";
export default interface ProteomicsCountTableProcessor<OntologyId extends OntologyCode> extends CountTableProcessor<OntologyId> {
    getAnnotationPeptideMapping(): Map<OntologyId, Peptide[]>;
}
