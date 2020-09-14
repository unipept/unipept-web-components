import { Peptide } from "./../../ontology/raw/Peptide";
import { OntologyIdType } from "./../../ontology/Ontology";
export declare function mergeResultMaps(countsPerCodeMaps: Map<OntologyIdType, number>[], item2PeptidesMaps: Map<OntologyIdType, Peptide[]>[]): Promise<[Map<OntologyIdType, number>, Map<OntologyIdType, Peptide[]>]>;
export declare function compute(peptideCounts: Map<Peptide, number>, indexBuffer: SharedArrayBuffer, dataBuffer: SharedArrayBuffer, percentage: number, termPrefix: string, proteinCountProperty: string): Promise<[Map<OntologyIdType, number>, Map<OntologyIdType, Peptide[]>, number]>;
