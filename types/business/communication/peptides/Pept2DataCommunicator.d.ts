import { CountTable, Peptide, PeptideData, ProgressListener, SearchConfiguration } from "@/business";
import { ShareableMap } from "shared-memory-datastructures";
export default class Pept2DataCommunicator {
    private readonly serviceUrl;
    static PEPTDATA_BATCH_SIZE: number;
    static MISSED_CLEAVAGE_BATCH: number;
    static PEPTDATA_ENDPOINT: string;
    private cancelled;
    constructor(serviceUrl: string);
    process(countTable: CountTable<Peptide>, configuration: SearchConfiguration, progressListener?: ProgressListener): Promise<ShareableMap<Peptide, PeptideData>>;
    cancel(): void;
}
