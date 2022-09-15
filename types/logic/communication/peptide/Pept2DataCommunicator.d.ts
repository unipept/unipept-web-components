import ProgressListener from "../../../logic/listeners/ProgressListener";
import Peptide from "../../../logic/ontology/peptide/Peptide";
import CountTable from "../../../logic/processing/CountTable";
import PeptideTrust from "../../../logic/processing/peptide/PeptideTrust";
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
