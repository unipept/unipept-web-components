import { CountTable, Peptide, SearchConfiguration, ProgressListener, PeptideTrust, PeptideData } from "@/business";
import { ShareableMap } from "shared-memory-datastructures";
/**
 * Communicates with the Unipept API through a separate worker in its own thread.
 *
 * @author Pieter Verschaffelt
 */
export default class Pept2DataCommunicator {
    private static configurationToResponses;
    private static configurationToProcessed;
    private static inProgress;
    static PEPTDATA_BATCH_SIZE: number;
    static MISSED_CLEAVAGE_BATCH: number;
    static PEPTDATA_ENDPOINT: string;
    static NETWORK_ERROR_TIMEOUT: number;
    private cancelled;
    /**
     * Look up all peptide data in the Unipept API for each peptide in the given count table. It is guaranteed that
     * peptides that were processed before, will not be looked up again, in order to save bandwidth and computation
     * time.
     *
     * @param countTable A count table containing all peptides for which all available information through the API
     * must be looked up. Only peptides that were not processed before, will be processed.
     * @param configuration Search settings that should be used while looking up the peptides.
     * @param progressListener Listener that will be updated with current progress of resolving this
     * @throws NetworkCommunicationException If something goes wrong while communicating with the Unipept API (e.g.
     * server is unreachable, http 500 error, ...)
     */
    process(countTable: CountTable<Peptide>, configuration: SearchConfiguration, progressListener?: ProgressListener): Promise<void>;
    cancel(): void;
    getPeptideTrust(countTable: CountTable<Peptide>, configuration: SearchConfiguration): Promise<PeptideTrust>;
    /**
     * Returns all data associated with a specific peptide, if this peptide has been processed before. This means that
     * for an unseen count table, you must first call process!
     *
     * @param peptide A peptide sequence for which the response from Unipept's API should be returned.
     * @param configuration The search settings that need to be applied when looking for this peptide.
     * @return The data that was retrieved through Unipept's API if the peptide is known. Returns undefined otherwise.
     */
    getPeptideResponse(peptide: string, configuration: SearchConfiguration): PeptideData;
    getPeptideResponseMap(configuration: SearchConfiguration): ShareableMap<string, PeptideData>;
    private getUnprocessedPeptides;
}
