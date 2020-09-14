import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
export default function compute(peptideCountTable: CountTable<Peptide>, indexBuffer: SharedArrayBuffer, dataBuffer: SharedArrayBuffer): (Map<number, string[]> | Map<number, number>)[];
