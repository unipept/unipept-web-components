import ProgressListener from "../../../logic/listeners/ProgressListener";
import Peptide from "../../../logic/ontology/peptide/Peptide";
import CountTable from "../../../logic/processing/CountTable";
import PeptideTrust from "../../../logic/processing/peptide/PeptideTrust";
import { ShareableMap } from "shared-memory-datastructures";
import PeptideData from "./PeptideData";
export default class Pept2DataCommunicator {
    private readonly apiBaseUrl;
    private readonly peptdataBatchSize;
    private readonly missedCleavageBatchSize;
    private readonly parallelRequests;
    private cancelled;
    constructor(apiBaseUrl?: string, peptdataBatchSize?: number, missedCleavageBatchSize?: number, parallelRequests?: number);
    process(countTable: CountTable<Peptide>, enableMissingCleavageHandling: boolean, equateIl: boolean, progressListener?: ProgressListener): Promise<[ShareableMap<Peptide, PeptideData>, PeptideTrust]>;
    cancel(): void;
}
