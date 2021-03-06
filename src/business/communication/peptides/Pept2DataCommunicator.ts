import {
    CountTable,
    Peptide,
    SearchConfiguration,
    ProgressListener,
    NetworkCommunicationException,
    NetworkConfiguration,
    PeptideTrust,
    PeptideData,
    NetworkUtils,
    PeptideDataSerializer,
    Pept2DataApiResponse
} from "@/business";

import { ShareableMap } from "shared-memory-datastructures";
import parallelLimit from "async/parallelLimit";
/**
 * Communicates with the Unipept API through a separate worker in its own thread.
 *
 * @author Pieter Verschaffelt
 */
export default class Pept2DataCommunicator {
    // Maps a configuration (as string) onto a map in which peptides are mapped onto their responses.
    private static configurationToResponses = new Map<string, ShareableMap<string, PeptideData>>();
    // Keeps track of which peptides have been processed per concrete configuration
    private static configurationToProcessed = new Map<string, Set<Peptide>>();
    private static inProgress: Promise<void>;

    public static PEPTDATA_BATCH_SIZE = 100;
    public static MISSED_CLEAVAGE_BATCH = 25;
    public static PEPTDATA_ENDPOINT = "/mpa/pept2data";
    // If a network error occurs, wait this amount of time before trying the same request again. This measure helps to
    // prevent temporary network errors to kill the complete assay analysis.
    public static NETWORK_ERROR_TIMEOUT = 1000 * 60;

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

        const batchSize = configuration.enableMissingCleavageHandling ?
            Pept2DataCommunicator.MISSED_CLEAVAGE_BATCH : Pept2DataCommunicator.PEPTDATA_BATCH_SIZE;

        Pept2DataCommunicator.inProgress = new Promise<void>(async(resolve, reject) => {
            const responses = new ShareableMap<string, PeptideData>(
                undefined,
                undefined,
                new PeptideDataSerializer()
            );

            progressListener?.onProgressUpdate(0.0);
            let previousProgress: number = 0;

            let peptides: Peptide[] = this.getUnprocessedPeptides(countTable.getOntologyIds(), configuration);

            const requests = [];
            for (let i = 0; i < peptides.length; i += batchSize) {
                requests.push(async(done: (val: any) => void) => {
                    if (this.cancelled) {
                        done(new Error("Cancelled execution"));
                        return;
                    }

                    const data = JSON.stringify({
                        peptides: peptides.slice(i, i + batchSize),
                        equate_il: configuration.equateIl,
                        missed: configuration.enableMissingCleavageHandling
                    });

                    let didRetry: number = 0;

                    while (didRetry < 2) {
                        try {
                            const res = await NetworkUtils.postJSON(
                                NetworkConfiguration.BASE_URL + Pept2DataCommunicator.PEPTDATA_ENDPOINT,
                                data
                            );

                            res.peptides.forEach((p: Pept2DataApiResponse) => {
                                responses.set(p.sequence, PeptideData.createFromPeptideDataResponse(p));
                            })

                            if (previousProgress < i / peptides.length) {
                                previousProgress = i / peptides.length;
                                progressListener?.onProgressUpdate(i / peptides.length);
                            }
                            didRetry = 2;
                            done(null);
                        } catch (err) {
                            if (didRetry < 1) {
                                didRetry += 1;
                                await new Promise<void>(
                                    (resolve) => setTimeout(resolve, Pept2DataCommunicator.NETWORK_ERROR_TIMEOUT)
                                );
                            } else {
                                // Fetch errors need to be handled by the outer scope.
                                done(err);
                            }
                        }
                    }
                });
            }


            try {
                await parallelLimit(requests, NetworkConfiguration.PARALLEL_API_REQUESTS);

                if (!this.cancelled) {
                    const config = configuration.enableMissingCleavageHandling.toString() +
                        NetworkConfiguration.BASE_URL;

                    if (!Pept2DataCommunicator.configurationToResponses.has(config)) {
                        Pept2DataCommunicator.configurationToResponses.set(
                            config,
                            new ShareableMap<string, PeptideData>(
                                undefined,
                                undefined,
                                new PeptideDataSerializer()
                            )
                        );
                    }
                    const configMap = Pept2DataCommunicator.configurationToResponses.get(config);

                    for (const [pep, response] of responses) {
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
                }
            } catch (err) {
                console.error(err);
                if (!err.message.includes("Cancelled execution")) {
                    reject(err);
                } else {
                    resolve();
                }
            }
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
    public getPeptideResponse(peptide: string, configuration: SearchConfiguration): PeptideData {
        const configString = configuration.enableMissingCleavageHandling.toString() + NetworkConfiguration.BASE_URL;
        const responseMap = Pept2DataCommunicator.configurationToResponses.get(configString);
        if (!responseMap) {
            return undefined;
        }


        const response = responseMap.get(peptide);
        if (response) {
            return response;
        }

        return undefined;
    }

    public getPeptideResponseMap(configuration: SearchConfiguration): ShareableMap<string, PeptideData> {
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
