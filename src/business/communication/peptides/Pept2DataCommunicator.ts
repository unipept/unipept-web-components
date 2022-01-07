import {
    CountTable, NetworkConfiguration, NetworkUtils,
    PeptideData,
    PeptideDataSerializer, PeptideTrust, PeptideTrustProcessor,
    ProgressListener,
    SearchConfiguration
} from "@/business";
import { Peptide } from "./../../ontology/raw/Peptide"
import { ShareableMap } from "shared-memory-datastructures";
import { parallelLimit } from "async";
import AnalysisCancelledException from "@/business/exceptions/AnalysisCancelledException";

export default class Pept2DataCommunicator {
    public static PEPTDATA_BATCH_SIZE = 100;
    public static MISSED_CLEAVAGE_BATCH = 25;
    public static PEPTDATA_ENDPOINT = "/mpa/pept2data";

    // Should the analysis continue? If this flag is set to true, the analysis will be cancelled as soon as
    // possible and an exception will be thrown from the "process" function.
    private cancelled: boolean = false;

    public constructor(
        public readonly serviceUrl: string
    ) {}

    public async process(
        countTable: CountTable<Peptide>,
        configuration: SearchConfiguration,
        progressListener?: ProgressListener
    ): Promise<[ShareableMap<Peptide, PeptideData>, PeptideTrust]> {
        const peptidesToProcess = countTable.getOntologyIds();

        const result = new ShareableMap<Peptide, PeptideData>(undefined, undefined, new PeptideDataSerializer());

        progressListener?.onProgressUpdate(0.0);
        let previousProgress: number = 0;

        const batchSize = configuration.enableMissingCleavageHandling ?
            Pept2DataCommunicator.MISSED_CLEAVAGE_BATCH : Pept2DataCommunicator.PEPTDATA_BATCH_SIZE;

        const requests = [];
        for (let i = 0; i < peptidesToProcess.length; i += batchSize) {
            requests.push(async(done: (val: any) => void) => {
                if (this.cancelled) {
                    // Stop the processing and let this error be handled by the outer scope.
                    done(new Error("Cancelled execution"));
                    return;
                }

                const requestData = JSON.stringify({
                    peptides: peptidesToProcess.slice(i, i + batchSize),
                    equate_il: configuration.equateIl,
                    missed: configuration.enableMissingCleavageHandling
                });

                try {
                    const response = await NetworkUtils.postJSON(
                        this.serviceUrl + Pept2DataCommunicator.PEPTDATA_ENDPOINT,
                        requestData
                    );

                    for (const p of response.peptides) {
                        result.set(p.sequence, PeptideData.createFromPeptideDataResponse(p));
                    }

                    if (previousProgress < i / peptidesToProcess.length) {
                        previousProgress = i / peptidesToProcess.length;
                        progressListener?.onProgressUpdate(i / peptidesToProcess.length);
                    }

                    // Successfully handled this request.
                    done(null);
                } catch (err) {
                    // Fetch errors will be handled by the outer scope.
                    done(err);
                }
            });
        }

        // Now perform the actual requests.
        try {
            await parallelLimit(requests, NetworkConfiguration.PARALLEL_API_REQUESTS);
            const trustProcessor = new PeptideTrustProcessor();
            const trust = trustProcessor.getPeptideTrust(countTable, result);
            return [result, trust];
        } catch (err) {
            // Something went wrong during the analysis. Either the analysis was cancelled, or some other exception
            // occurred.

            if (err.message.includes("Cancelled execution")) {
                throw new AnalysisCancelledException();
            } else {
                throw err;
            }
        }
    }

    public cancel() {
        this.cancelled = true;
    }
}
