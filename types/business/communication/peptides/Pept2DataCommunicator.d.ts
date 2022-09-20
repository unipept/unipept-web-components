import { CountTable, PeptideData, PeptideTrust, ProgressListener, SearchConfiguration } from "@/business";
import { Peptide } from "./../../ontology/raw/Peptide";
import { ShareableMap } from "shared-memory-datastructures";
export default class Pept2DataCommunicator {
    readonly serviceUrl: string;
    readonly cacheKey: string;
    static PEPTDATA_BATCH_SIZE: number;
    static MISSED_CLEAVAGE_BATCH: number;
    static PEPTDATA_ENDPOINT: string;
    private cancelled;
    /**
     * Construct a new Pept2DataCommunicator that can be used to extract peptide information from the Unipept API.
     *
     * @param serviceUrl Base URL of the handling server. This URL will be used to perform all communication with.
     * @param cacheKey This key can be used to more fine-grained invalidate or validate requests from the request
     * cache. In some cases the same base URL is used with a different type of database, causing the requests to be
     * invalidated.
     */
    constructor(serviceUrl: string, cacheKey?: string);
    process(countTable: CountTable<Peptide>, configuration: SearchConfiguration, progressListener?: ProgressListener): Promise<[ShareableMap<Peptide, PeptideData>, PeptideTrust]>;
    cancel(): void;
}
