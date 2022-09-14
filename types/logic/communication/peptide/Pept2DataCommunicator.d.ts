import { ProgressListener } from "@/logic/listeners";
import { Peptide } from "@/logic/ontology";
import { CountTable, PeptideTrust } from "@/logic/processing";
import { ShareableMap } from "shared-memory-datastructures";
import PeptideData from "./PeptideData";
export default class Pept2DataCommunicator {
    private static readonly apiBaseUrl;
    static PEPTDATA_BATCH_SIZE: number;
    static MISSED_CLEAVAGE_BATCH: number;
    static PEPTDATA_ENDPOINT: string;
    private cancelled;
    process(countTable: CountTable<Peptide>, enableMissingCleavageHandling: boolean, equateIl: boolean, progressListener?: ProgressListener): Promise<[ShareableMap<Peptide, PeptideData>, PeptideTrust]>;
    cancel(): void;
}
