export class CountTable<OntologyId> {
    // The total amount of definitions in this count table (sum of the counts of all rows)
    public readonly totalCount: number;

    /**
     * @param counts Frequency table for a specific ontology. Maps unique ontology id's onto the associated
     * absolute occurrence in a specific sample. Ontology id's that do not occur in this sample should not be included
     * (no zero counts in the frequency table).
     */
    constructor(
        private readonly counts: Map<OntologyId, number>,
    ) {
        let ontologyCounts = [...counts.values()];
        this.totalCount = ontologyCounts.length? [...counts.values()].reduce((a, b) => a + b) : 0;
    }

    getCounts(id: OntologyId): number {
        return this.counts.get(id);
    }

    /**
     * Get all unique ontology id's that are present in this count table.
     */
    getOntologyIds() : OntologyId[] {
        return Array.from(this.counts.keys());
    }
}
