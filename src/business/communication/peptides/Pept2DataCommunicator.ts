import { PeptideDataResponse } from "./PeptideDataResponse";
import { CountTable } from "./../../counts/CountTable";
import { Peptide } from "./../../ontology/raw/Peptide";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import Worker from "worker-loader!./Pept2Data.worker.js";
import ProgressListener from "./../../progress/ProgressListener";
import NetworkCommunicationException from "./../../exceptions/NetworkCommunicationException";
import NetworkConfiguration from "./../NetworkConfiguration";
import PeptideTrust from "./../../processors/raw/PeptideTrust";

/**
 * Communicates with the Unipept API through a separate worker in its own thread.
 *
 * @author Pieter Verschaffelt
 */
export default class Pept2DataCommunicator {
    // Maps a configuration (as string) onto a map in which peptides are mapped onto their responses.
    private static configurationToResponses = new Map<string, Map<string, PeptideDataResponse>>();
    // Keeps track of which peptides have been processed per concrete configuration
    private static configurationToProcessed = new Map<string, Set<Peptide>>();
    private static inProgress: Promise<void>;

    /**
     * Look up all peptide data in the Unipept API for each peptide in the given count table. It is guaranteed that
     * peptides that were processed before, will not be looked up again, in order to save bandwidth and computation
     * time.
     *
     * @param countTable A count table containing all peptides for which all available information through the API
     * must be looked up. Only peptides that were not processed before, will be processed.
     * @param configuration Search settings that should be used while looking up the peptides.
     * @param progressListener Listener that will be updated with current progress of resolving this
     */
    public static async process(
        countTable: CountTable<Peptide>,
        configuration: SearchConfiguration,
        progressListener?: ProgressListener
    ): Promise<void> {
        if (this.inProgress) {
            try {
                await this.inProgress;
            } catch (err) {
                // Ignore errors here, to avoid them being thrown more than once...
            }
        }

        const peptides: Peptide[] = this.getUnprocessedPeptides(countTable.getOntologyIds(), configuration);

        this.inProgress = new Promise<void>((resolve, reject) => {
            const worker = new Worker();
            const config = JSON.stringify(configuration);

            worker.onmessage = (event) => {
                switch (event.data.type) {
                case "progress":
                    if (progressListener) {
                        progressListener.onProgressUpdate(event.data.value);
                    }
                    break;
                case "result":
                    // Set all data values that we received from the worker.
                    const resultMap: Map<Peptide, PeptideDataResponse> = event.data.value;

                    if (!this.configurationToResponses.has(config)) {
                        this.configurationToResponses.set(config, new Map());
                    }
                    const configMap = this.configurationToResponses.get(config);

                    for (const [pep, response] of resultMap) {
                        configMap.set(pep, response);
                    }

                    if (!this.configurationToProcessed.has(config)) {
                        this.configurationToProcessed.set(config, new Set());
                    }
                    const processedSet = this.configurationToProcessed.get(config);
                    for (const pep of peptides) {
                        processedSet.add(pep);
                    }

                    // We're done. Resolve this promise.
                    resolve();
                    break;
                case "error":
                    // An error occurred during communication with Unipept's API in the worker.
                    reject(new NetworkCommunicationException(event.data.value));
                    break;
                }
            }

            worker.postMessage({
                peptides: peptides,
                config: {
                    equateIl: configuration.equateIl,
                    filterDuplicates: configuration.filterDuplicates,
                    enableMissingCleavageHandling: configuration.enableMissingCleavageHandling
                },
                baseUrl: NetworkConfiguration.BASE_URL
            });
        });

        try {
            await this.inProgress;
        } finally {
            this.inProgress = undefined;
        }
    }

    public static async getPeptideTrust(
        countTable: CountTable<Peptide>,
        configuration: SearchConfiguration
    ): Promise<PeptideTrust> {
        await this.process(countTable, configuration);
        const responseMap = this.configurationToResponses.get(JSON.stringify(configuration));

        let matchedPeptides: number = 0;
        let missedPeptides: Peptide[] = [];

        for (const peptide of countTable.getOntologyIds()) {
            if (!responseMap.has(peptide)) {
                missedPeptides.push(peptide);
            } else {
                matchedPeptides += countTable.getCounts(peptide);
            }
        }

        return new PeptideTrust(missedPeptides, matchedPeptides, countTable.totalCount);
    }

    /**
     * Returns all data associated with a specific peptide, if this peptide has been processed before. This means that
     * for an unseen count table, you must first call process!
     *
     * @param peptide A peptide sequence for which the response from Unipept's API should be returned.
     * @param configuration The search settings that need to be applied when looking for this peptide.
     * @return The data that was retrieved through Unipept's API if the peptide is known. Returns undefined otherwise.
     */
    public static getPeptideResponse(peptide: string, configuration: SearchConfiguration): PeptideDataResponse {
        const configString = JSON.stringify(configuration);
        const responseMap = this.configurationToResponses.get(configString);
        if (!responseMap) {
            return undefined;
        }
        return responseMap.get(peptide);
    }

    private static getUnprocessedPeptides(peptides: Peptide[], configuration: SearchConfiguration): Peptide[] {
        const configString = JSON.stringify(configuration);
        if (!this.configurationToProcessed.has(configString)) {
            return peptides;
        }

        const processed = this.configurationToProcessed.get(configString);
        return peptides.filter(p => !processed.has(p));
    }
}
