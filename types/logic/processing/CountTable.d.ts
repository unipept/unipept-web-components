import OntologyCode from "../ontology/OntologyCode";
export default class CountTable<OntologyId extends OntologyCode> {
    private readonly counts;
    readonly totalCount: number;
    /**
     * @param counts Frequency table for a specific ontology. Maps unique ontology id's onto the associated
     * absolute occurrence in a specific sample. Ontology id's that do not occur in this sample should not be included
     * (no zero counts in the frequency table).
     * @param totalCount The total amount of definitions in this count table (sum of the counts of all rows)
     */
    constructor(counts: Map<OntologyId, number>, totalCount?: number);
    getCounts(id: OntologyId): number;
    /**
     * Get all unique ontology id's that are present in this count table.
     */
    getOntologyIds(): OntologyId[];
    toMap(): Map<OntologyId, number>;
}
