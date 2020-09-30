import { CountTable } from "@/business/counts/CountTable";
import { Peptide } from "@/business/ontology/raw/Peptide";
import { NcbiId } from "@/business/ontology/taxonomic/ncbi/NcbiTaxon";
export declare function compute([peptideCountTable, indexBuffer, dataBuffer]: [CountTable<Peptide>, ArrayBuffer, ArrayBuffer]): Promise<[Map<NcbiId, number>, Map<NcbiId, Peptide[]>]>;
