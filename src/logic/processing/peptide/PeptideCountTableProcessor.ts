import Peptide from "../../../logic/ontology/peptide/Peptide";
import QueueManager from "../../../logic/util/queue/QueueManager";
import CountTable from "../CountTable";

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
        enableMissingCleavageHandling: boolean, 
        filterDuplicates: boolean, 
        equateIl: boolean
    ): Promise<CountTable<Peptide>> {
        const [peptideCountsMapping, totalFrequency] = await QueueManager.getLongRunningQueue().pushTask<
            [Map<Peptide, number>, number],
            [Peptide[], boolean, boolean, boolean]
        >("computePeptideCountTable", [peptides, enableMissingCleavageHandling, filterDuplicates, equateIl]);

        return new CountTable<Peptide>(peptideCountsMapping, totalFrequency);
    }
}
