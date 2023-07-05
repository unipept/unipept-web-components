import AnalysisCancelledException from "../../../logic/exceptions/AnalysisCancelledException";
import ProgressListener from "../../../logic/listeners/ProgressListener";
import Peptide from "../../../logic/ontology/peptide/Peptide";
import CountTable from "../../../logic/processing/CountTable";
import PeptideTrust from "../../../logic/processing/peptide/PeptideTrust";
import PeptideTrustProcessor from "../../../logic/processing/peptide/PeptideTrustProcessor";
import { parallelLimit } from "async";
import { ShareableMap } from "shared-memory-datastructures";
import NetworkUtils from "../../util/NetworkUtils";
import PeptideData from "./PeptideData";
import PeptideDataSerializer from "./PeptideDataSerializer";
import NetworkCacheManager from "../NetworkCacheManager";

export default class Pept2DataCommunicator {
    // Should the analysis continue? If this flag is set to true, the analysis will be cancelled as soon as
    // possible and an exception will be thrown from the "process" function.
    private cancelled = false;

    constructor(
        private readonly apiBaseUrl: string = "http://api.unipept.ugent.be",
        private readonly peptdataBatchSize: number = 100,
        private readonly missedCleavageBatchSize: number = 25,
        private readonly parallelRequests: number = 5,
        public readonly cacheKey: string = ""
    ) {}

    public async process(
        countTable: CountTable<Peptide>,
        enableMissingCleavageHandling: boolean,
        equateIl: boolean,
        progressListener?: ProgressListener
    ): Promise<[ShareableMap<Peptide, PeptideData>, PeptideTrust]> {
        const result = new ShareableMap<Peptide, PeptideData>(undefined, undefined, new PeptideDataSerializer());

        const peptidesToProcess = countTable.getOntologyIds();
        const amountOfPeptides = peptidesToProcess.length;

        progressListener?.onProgressUpdate(0.0);
        let previousProgress = 0;

        const batchSize = enableMissingCleavageHandling ? this.missedCleavageBatchSize : this.peptdataBatchSize;

        const networkManager = new NetworkCacheManager(this.apiBaseUrl, this.cacheKey);

        const requests = [];
        for (let i = 0; i < amountOfPeptides + batchSize; i += batchSize) {
            requests.push(async() => {
                if(this.cancelled) {
                    throw new AnalysisCancelledException();
                }

                const requestData = JSON.stringify({
                    peptides: peptidesToProcess.slice(i, i + batchSize),
                    equate_il: equateIl,
                    missed: enableMissingCleavageHandling
                });

                try {
                    const response = await networkManager.postJSON(this.apiBaseUrl + "/mpa/pept2data", requestData);

                    for (const peptide of response.peptides) {
                        result.set(peptide.sequence, PeptideData.createFromPeptideDataResponse(peptide));
                    }

                    const newProgress = Math.min(i, amountOfPeptides) / amountOfPeptides;
                    if(previousProgress < newProgress) {
                        previousProgress = newProgress;
                        progressListener?.onProgressUpdate(newProgress);
                    }

                    // Success!
                    return;
                } catch (err) { throw err; }
            });
        }

        try {
            // Perform the actual requests in parallel. (await cannot be removed!!)
            await parallelLimit(requests, this.parallelRequests);

            const trustProcessor = new PeptideTrustProcessor();
            const trust = trustProcessor.getPeptideTrust(countTable, result);

            return [result, trust];
        } catch (err) { throw err; }
    }

    public cancel() {
        this.cancelled = true;
    }
}
