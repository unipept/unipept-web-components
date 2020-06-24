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
import { ShareableMap } from "shared-memory-datastructures";

/**
 * Communicates with the Unipept API through a separate worker in its own thread.
 *
 * @author Pieter Verschaffelt
 */
export default class Pept2DataCommunicator {
    // Maps a configuration (as string) onto a map in which peptides are mapped onto their responses.
    private static configurationToResponses = new Map<string, ShareableMap<string, string>>();
    // Keeps track of which peptides have been processed per concrete configuration
    private static configurationToProcessed = new Map<string, Set<Peptide>>();
    private static inProgress: Promise<void>;
    private static worker;

    private cancelled: boolean = false;

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
    public async process(
        countTable: CountTable<Peptide>,
        configuration: SearchConfiguration,
        progressListener?: ProgressListener
    ): Promise<void> {
        const unprocessed = this.getUnprocessedPeptides(countTable.getOntologyIds(), configuration);
        if (!unprocessed || unprocessed.length === 0) {
            if (progressListener) {
                progressListener.onProgressUpdate(1.0);
            }
            return;
        }

        while (Pept2DataCommunicator.inProgress) {
            await Pept2DataCommunicator.inProgress;
        }

        if (this.cancelled) {
            return;
        }

        Pept2DataCommunicator.inProgress = new Promise<void>(async(resolve, reject) => {
            let peptides: Peptide[] = this.getUnprocessedPeptides(countTable.getOntologyIds(), configuration);

            if (!peptides || peptides.length === 0) {
                if (progressListener) {
                    progressListener.onProgressUpdate(1.0);
                }
                resolve();
                return;
            }

            if (!Pept2DataCommunicator.worker) {
                Pept2DataCommunicator.worker = await spawn(new Worker("./Pept2Data.worker.ts"));
            }

            const obs: Observable<{ type: string, value: any }> = Pept2DataCommunicator.worker.process(
                peptides,
                {
                    equateIl: configuration.equateIl,
                    filterDuplicates: configuration.filterDuplicates,
                    enableMissingCleavageHandling: configuration.enableMissingCleavageHandling
                },
                NetworkConfiguration.BASE_URL
            );

            let previousProgress: number = 0;

            obs.subscribe(message => {
                if (message.type === "progress") {
                    if (progressListener && message.value > previousProgress) {
                        if (this.cancelled) {
                            Pept2DataCommunicator.worker.cancel();
                        }

                        previousProgress = message.value;
                        progressListener.onProgressUpdate(message.value);
                    }
                } else if (message.type === "result") {
                    const [indexBuffer, dataBuffer] = message.value;

                    const resultMap = new ShareableMap<Peptide, string>(0, 0);
                    resultMap.setBuffers(indexBuffer.transferables[0], dataBuffer.transferables[0]);

                    const config = configuration.enableMissingCleavageHandling.toString() + NetworkConfiguration.BASE_URL;

                    if (!Pept2DataCommunicator.configurationToResponses.has(config)) {
                        Pept2DataCommunicator.configurationToResponses.set(config, new ShareableMap<string, string>());
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
                } else if (message.type === "cancelled") {
                    resolve();
                }
            });
        });

        try {
            await Pept2DataCommunicator.inProgress;
        } finally {
            Pept2DataCommunicator.inProgress = undefined;
        }
    }

    public cancel() {
        this.cancelled = true;
    }

    public async getPeptideTrust(
        countTable: CountTable<Peptide>,
        configuration: SearchConfiguration
    ): Promise<PeptideTrust> {
        await this.process(countTable, configuration);
        const responseMap = Pept2DataCommunicator.configurationToResponses.get(
            configuration.enableMissingCleavageHandling.toString() + NetworkConfiguration.BASE_URL
        );

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
    public getPeptideResponse(peptide: string, configuration: SearchConfiguration): PeptideDataResponse {
        const configString = configuration.enableMissingCleavageHandling.toString() + NetworkConfiguration.BASE_URL;
        const responseMap = Pept2DataCommunicator.configurationToResponses.get(configString);
        if (!responseMap) {
            return undefined;
        }


        const response = responseMap.get(peptide);
        if (response) {
            return JSON.parse(response);
        }

        return undefined;
    }

    public getPeptideResponseMap(configuration: SearchConfiguration): ShareableMap<Peptide, string> {
        const configString = configuration.enableMissingCleavageHandling.toString() + NetworkConfiguration.BASE_URL;
        return Pept2DataCommunicator.configurationToResponses.get(configString);
    }

    private getUnprocessedPeptides(peptides: Peptide[], configuration: SearchConfiguration): Peptide[] {
        const configString = configuration.enableMissingCleavageHandling.toString() + NetworkConfiguration.BASE_URL;
        if (!Pept2DataCommunicator.configurationToProcessed.has(configString)) {
            return peptides;
        }

        const processed = Pept2DataCommunicator.configurationToProcessed.get(configString);
        return peptides.filter(p => !processed.has(p));
    }
}
