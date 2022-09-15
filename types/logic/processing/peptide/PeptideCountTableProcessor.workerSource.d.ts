import Peptide from "../../../logic/ontology/peptide/Peptide";
/**
 * Convert a list of peptides into a count table with respect to a given set of search settings. This count table maps
 * peptides onto the amount of times they occur in the given list.
 *
 * @param peptides A list of peptides for which a count table should be constructed.
 * @param searchConfiguration Indicates to which rules the processing should adhere.
 * @returns A tuple with 2 items. The first item is a mapping between a peptide and it's frequency, and the second item
 * is the total frequency of all items combined (from the first map).
 */
export declare function compute([peptides, enableMissingCleavageHandling, filterDuplicates, equateIl]: [
    Peptide[],
    boolean,
    boolean,
    boolean
]): Promise<[Map<Peptide, number>, number]>;
