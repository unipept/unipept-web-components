import { PeptideDataResponse } from "./PeptideDataResponse";
import { CountTable } from "./../../counts/CountTable";
import { Peptide } from "./../../ontology/raw/Peptide";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import { spawn, Worker } from "threads";
import { Observable } from "observable-fns";
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
    private static processing: boolean = false;
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
     * @throws NetworkCommunicationException If something goes wrong while communicating with the Unipept API (e.g.
     * server is unreachable, http 500 error, ...)
     */
    public static async process(
        countTable: CountTable<Peptide>,
        configuration: SearchConfiguration,
        progressListener?: ProgressListener
    ): Promise<void> {
        const unprocessed = this.getUnprocessedPeptides(countTable.getOntologyIds(), configuration);
        if (!unprocessed || unprocessed.length === 0) {
            return;
        }

        while (this.inProgress) {
            await this.inProgress;
        }

        this.inProgress = new Promise<void>(async(resolve, reject) => {
            let peptides: Peptide[] = this.getUnprocessedPeptides(countTable.getOntologyIds(), configuration);

            if (!peptides || peptides.length === 0) {
                resolve();
                return;
            }

            const spawnedProcess = await spawn(new Worker("./Pept2Data.worker.ts"));

            const obs: Observable<{ type: string, value: any }> = spawnedProcess(
                peptides,
                {
                    equateIl: configuration.equateIl,
                    filterDuplicates: configuration.filterDuplicates,
                    enableMissingCleavageHandling: configuration.enableMissingCleavageHandling
                },
                NetworkConfiguration.BASE_URL
            );


            obs.subscribe(message => {
                if (message.type === "progress") {
                    if (progressListener) {
                        progressListener.onProgressUpdate(message.value);
                    }
                } else if (message.type === "result") {
                    const resultMap = message.value;
                    const config = JSON.stringify(configuration) + NetworkConfiguration.BASE_URL;

                    if (!Pept2DataCommunicator.configurationToResponses.has(config)) {
                        Pept2DataCommunicator.configurationToResponses.set(config, new Map());
                    }
                    const configMap = Pept2DataCommunicator.configurationToResponses.get(config);

                    for (const [pep, response] of resultMap) {
                        configMap.set(pep, response);
                    }

                    if (!Pept2DataCommunicator.configurationToProcessed.has(config)) {
                        Pept2DataCommunicator.configurationToProcessed.set(config, new Set());
                    }
                    const processedSet = Pept2DataCommunicator.configurationToProcessed.get(config);
                    for (const pep of peptides) {
                        processedSet.add(pep);
                    }

                    resolve();
                } else if (message.type === "error") {
                    reject(new NetworkCommunicationException(message.value));
                }
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
        const responseMap = this.configurationToResponses.get(JSON.stringify(configuration) + NetworkConfiguration.BASE_URL);

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
        const configString = JSON.stringify(configuration) + NetworkConfiguration.BASE_URL;
        const responseMap = this.configurationToResponses.get(configString);
        if (!responseMap) {
            return undefined;
        }
        return responseMap.get(peptide);
    }

    public static getPeptideResponseMap(configuration: SearchConfiguration): Map<Peptide, PeptideDataResponse> {
        const configString = JSON.stringify(configuration) + NetworkConfiguration.BASE_URL;
        return Pept2DataCommunicator.configurationToResponses.get(configString);
    }

    private static getUnprocessedPeptides(peptides: Peptide[], configuration: SearchConfiguration): Peptide[] {
        const configString = JSON.stringify(configuration) + NetworkConfiguration.BASE_URL;
        if (!this.configurationToProcessed.has(configString)) {
            return peptides;
        }

        const processed = this.configurationToProcessed.get(configString);
        return peptides.filter(p => !processed.has(p));
    }
}
