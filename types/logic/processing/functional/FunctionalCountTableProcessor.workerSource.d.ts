import { FunctionalCode, Peptide } from "@/logic/ontology";
declare function compute([peptideCounts, indexBuffer, dataBuffer, percentage, termPrefix, proteinCountProperty]: [
    Map<Peptide, number>,
    ArrayBuffer,
    ArrayBuffer,
    number,
    string,
    string
]): Promise<[Map<FunctionalCode, number>, Map<FunctionalCode, Peptide[]>, number]>;
export default compute;
