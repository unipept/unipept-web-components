import FunctionalCode from "../../../logic/ontology/functional/FunctionalCode";
import Peptide from "../../../logic/ontology/peptide/Peptide";
export default function compute([peptideCounts, indexBuffer, dataBuffer, percentage, termPrefix, proteinCountProperty]: [
    Map<Peptide, number>,
    ArrayBuffer,
    ArrayBuffer,
    number,
    string,
    string
]): Promise<[Map<FunctionalCode, number>, Map<FunctionalCode, Peptide[]>, number]>;
