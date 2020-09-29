import { Peptide } from "./../../ontology/raw/Peptide";
import { CountTable } from "./../../counts/CountTable";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import Worker from "worker-loader?inline=fallback!./PeptideCountProcessor.worker";
import async, { AsyncQueue } from "async";
import { QueueManager } from "@/business";

export default class PeptideCountTableProcessor {
    public static PEPTIDE_COUNT_PROCESSOR_PARALLEL_LIMIT: number = 4;

    private static queue: AsyncQueue<any>;

    /**
     * Convert a list of peptides into a count table. This function directly filters the given list of peptides, based
     * on the search configuration given here.
     *
     * @param peptides The (unfiltered) list of peptides for which a count table should be built.
     * @param searchConfiguration A configuration that indicates what extra processing steps should be applied to the
     * list of peptides, before converting them to a count table.
     */
    public async getPeptideCountTable(
        peptides: Peptide[],
        searchConfiguration: SearchConfiguration
    ): Promise<CountTable<Peptide>> {
        return QueueManager.getLongRunningQueue().pushTask<CountTable<Peptide>>(() => {
            return new Promise<CountTable<Peptide>>((resolve) => {
                const worker = new Worker();

                worker.addEventListener("message", (event: MessageEvent) => {
                    const [peptideCountsMapping, totalFrequency] = event.data.result;
                    worker.terminate();
                    resolve(new CountTable<Peptide>(peptideCountsMapping, totalFrequency));
                });

                worker.postMessage({
                    args: [peptides, searchConfiguration]
                });
            });

        });
    }
}
