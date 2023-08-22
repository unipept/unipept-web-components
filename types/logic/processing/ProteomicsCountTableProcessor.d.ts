import OntologyCode from "../ontology/OntologyCode";
import Peptide from "../ontology/peptide/Peptide";
import CountTableProcessor from "./CountTableProcessor";
export default interface ProteomicsCountTableProcessor<OntologyId extends OntologyCode> extends CountTableProcessor<OntologyId> {
    getAnnotationPeptideMapping(): Map<OntologyId, Peptide[]>;
}
