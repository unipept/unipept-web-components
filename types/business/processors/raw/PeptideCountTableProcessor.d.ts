import { Peptide } from "./../../ontology/raw/Peptide";
import { CountTable } from "./../../counts/CountTable";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
export default class PeptideCountTableProcessor {
    static THREAD_COUNT: number;
    private static worker;
    /**
     * Convert a list of peptides into a count table. This function directly filters the given list of peptides, based
     * on the search configuration given here.
     *
     * @param peptides The (unfiltered) list of peptides for which a count table should be built.
     * @param searchConfiguration A configuration that indicates what extra processing steps should be applied to the
     * list of peptides, before converting them to a count table.
     */
    getPeptideCountTable(peptides: Peptide[], searchConfiguration: SearchConfiguration): Promise<CountTable<Peptide>>;
}
