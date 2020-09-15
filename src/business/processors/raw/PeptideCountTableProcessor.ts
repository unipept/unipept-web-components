import { Peptide } from "./../../ontology/raw/Peptide";
import { CountTable } from "./../../counts/CountTable";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import Worker from "worker-loader?inline=fallback!./PeptideCountProcessor.worker";

export default class PeptideCountTableProcessor {
    public static THREAD_COUNT: number = 4;
    // private static pool = Pool(
    //     () => spawn(new Worker("./PeptideCountProcessor.worker.ts")),
    //     PeptideCountTableProcessor.THREAD_COUNT
    // );

    private static worker = new Worker();

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
        return new Promise<CountTable<Peptide>>((resolve) => {
            PeptideCountTableProcessor.worker.addEventListener("message", (event: MessageEvent) => {
                const [peptideCountsMapping, totalFrequency] = event.data.result;
                resolve(new CountTable<Peptide>(peptideCountsMapping, totalFrequency));
            });

            PeptideCountTableProcessor.worker.postMessage({
                args: [peptides, searchConfiguration]
            });

            // PeptideCountTableProcessor.pool.queue(async(worker) => {
            //     const [peptideCountsMapping, totalFrequency] = await worker(peptides, searchConfiguration);
            //     resolve(new CountTable<Peptide>(peptideCountsMapping, totalFrequency))
            // });
        });
    }
}
