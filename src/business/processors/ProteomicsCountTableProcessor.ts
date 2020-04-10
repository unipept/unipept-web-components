import { CountTable } from "./../counts/CountTable";
import { Peptide } from "./../ontology/raw/Peptide";
import CountTableProcessor from "./CountTableProcessor";

export default interface ProteomicsCountTableProcessor<OntologyId> extends CountTableProcessor<OntologyId> {
    getAnnotationPeptideMapping(): Promise<Map<OntologyId, Peptide[]>>;
}
