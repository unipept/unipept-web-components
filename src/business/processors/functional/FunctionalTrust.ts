/**
 * Represents a report about how "well" the processing of peptides into specific count tables went. It can be used for
 * presenting how many peptides are annotated with at least one GO-term.
 *
 * @author Pieter Verschaffelt
 */
export default class FunctionalTrust {
    /**
     * @param annotatedItems How many of the items (e.g. peptides) that were looked up are, in-fact, associated with
     * at least one of the items in the resulting count table?
     * @param totalAmountOfItems How many items were looked up in total?
     */
    constructor(
        public readonly annotatedItems: number,
        public readonly totalAmountOfItems: number,
    ) {}
}
