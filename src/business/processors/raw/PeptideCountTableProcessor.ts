import { QueueManager, CountTable, SearchConfiguration, Peptide } from "@/business";

export default class PeptideCountTableProcessor {
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
        const [peptideCountsMapping, totalFrequency] = await QueueManager.getLongRunningQueue().pushTask<
            [Map<Peptide, number>, number],
            [Peptide[], SearchConfiguration]
        >("computePeptideCountTable", [peptides, searchConfiguration]);
        return new CountTable<Peptide>(peptideCountsMapping, totalFrequency);
    }
}
