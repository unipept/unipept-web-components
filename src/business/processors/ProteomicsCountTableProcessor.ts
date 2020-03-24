import { CountTable } from "./../counts/CountTable";
import { Peptide } from "./../ontology/raw/Peptide";

export default interface ProteomicsCountTableProcessor<OntologyId> {
    getCountTable(): Promise<CountTable<OntologyId>>;
    getAnnotationPeptideMapping(): Promise<Map<OntologyId, Peptide[]>>;
}
