import { FunctionalCode } from "@/business/ontology/functional/FunctionalDefinition";
import { Peptide } from "@/business/ontology/raw/Peptide";
export declare function compute([peptideCounts, indexBuffer, dataBuffer, percentage, termPrefix, proteinCountProperty]: [Map<Peptide, number>, ArrayBuffer, ArrayBuffer, number, string, string]): Promise<[Map<FunctionalCode, number>, Map<FunctionalCode, Peptide[]>, number]>;
