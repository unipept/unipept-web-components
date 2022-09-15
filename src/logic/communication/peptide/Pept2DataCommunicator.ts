import AnalysisCancelledException from "../../../logic/exceptions/AnalysisCancelledException";
import ProgressListener from "../../../logic/listeners/ProgressListener";
import Peptide from "../../../logic/ontology/peptide/Peptide";
import CountTable from "../../../logic/processing/CountTable";
import PeptideTrust from "../../../logic/processing/peptide/PeptideTrust";
import PeptideTrustProcessor from "../../../logic/processing/peptide/PeptideTrustProcessor";
import { parallelLimit } from "async";
import { ShareableMap } from "shared-memory-datastructures";
import NetworkConfiguration from "../NetworkConfiguration";
import NetworkUtils from "../NetworkUtils";
import PeptideData from "./PeptideData";
import PeptideDataSerializer from "./PeptideDataSerializer";

export default class Pept2DataCommunicator {
    private static readonly apiBaseUrl = "http://api.unipept.ugent.be/" // TODO: THIS CANNOT BE HARDCODED HERE!!!
    public static PEPTDATA_BATCH_SIZE = 100;
    public static MISSED_CLEAVAGE_BATCH = 25;
    public static PEPTDATA_ENDPOINT = "/mpa/pept2data";

    // Should the analysis continue? If this flag is set to true, the analysis will be cancelled as soon as
    // possible and an exception will be thrown from the "process" function.
    private cancelled = false;

    public async process(
        countTable: CountTable<Peptide>,
        enableMissingCleavageHandling: boolean,
        equateIl: boolean,
        progressListener?: ProgressListener
    ): Promise<[ShareableMap<Peptide, PeptideData>, PeptideTrust]> {
        const peptidesToProcess = countTable.getOntologyIds();

        const result = new ShareableMap<Peptide, PeptideData>(undefined, undefined, new PeptideDataSerializer());

        console.log("1")

        progressListener?.onProgressUpdate(0.0);
        let previousProgress = 0;

        console.log("2")

        const batchSize = enableMissingCleavageHandling ?
            Pept2DataCommunicator.MISSED_CLEAVAGE_BATCH : Pept2DataCommunicator.PEPTDATA_BATCH_SIZE;

        console.log("3")

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
                    equate_il: equateIl,
                    missed: enableMissingCleavageHandling
                });

                try {
                    const response = await NetworkUtils.postJSON(
                        Pept2DataCommunicator.apiBaseUrl + Pept2DataCommunicator.PEPTDATA_ENDPOINT,
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

        console.log("4")

        // Now perform the actual requests.
        try {
            parallelLimit(requests, NetworkConfiguration.PARALLEL_API_REQUESTS);
            console.log("4.1")
            const trustProcessor = new PeptideTrustProcessor();
            const trust = trustProcessor.getPeptideTrust(countTable, result);
            console.log("4.2")
            return [result, trust];
        } catch (err: any) {
            // Something went wrong during the analysis. Either the analysis was cancelled, or some other exception
            // occurred.

            console.log("4.error")

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
