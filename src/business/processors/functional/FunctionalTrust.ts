/**
 * Represents a report about how "well" the processing of peptides into specific count tables went. It can be used for
 * presenting how many peptides are annotated with at least one GO-term.
 *
 * @author Pieter Verschaffelt
 */
export default class FunctionalTrust {
    /**
     * @param annotatedPeptides How many of the peptides that were looked up are, in-fact, associated with at least one
     * of the items in the resulting count table?
     * @param totalAmountOfPeptides How many peptides were looked up in total?
     */
    constructor(
        public readonly annotatedPeptides,
        public readonly totalAmountOfPeptides,
    ) {}
}
