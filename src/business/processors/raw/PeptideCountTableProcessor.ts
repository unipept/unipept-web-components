import { Peptide } from "./../../ontology/raw/Peptide";
import { CountTable } from "./../../counts/CountTable";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import { spawn, Worker } from "threads"


export default class PeptideCountTableProcessor {
    private static worker;

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
        if (!PeptideCountTableProcessor.worker) {
            PeptideCountTableProcessor.worker = await spawn(new Worker("./PeptideCountProcessor.worker.ts"));
        }
        const start = new Date().getTime();
        const [peptideCountsMapping, totalFrequency] = await PeptideCountTableProcessor.worker(peptides, searchConfiguration);
        console.log("Total count processor: " + (new Date().getTime() - start) / 1000);
        return new CountTable<Peptide>(peptideCountsMapping, totalFrequency);
    }
}
