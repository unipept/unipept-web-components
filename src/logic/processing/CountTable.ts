import OntologyCode from "../ontology/OntologyCode";

export default class CountTable<OntologyId extends OntologyCode> {
    public readonly totalCount: number;

    /**
     * @param counts Frequency table for a specific ontology. Maps unique ontology id's onto the associated
     * absolute occurrence in a specific sample. Ontology id's that do not occur in this sample should not be included
     * (no zero counts in the frequency table).
     * @param totalCount The total amount of definitions in this count table (sum of the counts of all rows)
     */
    constructor(
        private readonly counts: Map<OntologyId, number>,
        totalCount?: number
    ) {
        if (!totalCount) {
            const ontologyCounts = [...counts.values()];
            this.totalCount = ontologyCounts.length? [...counts.values()].reduce((a, b) => a + b) : 0;
        } else {
            this.totalCount = totalCount;
        }
    }

    getCounts(id: OntologyId): number {
        const result = this.counts.get(id);
        if (!result) {
            return 0;
        }
        return result;
    }

    /**
     * Get all unique ontology id's that are present in this count table.
     */
    getOntologyIds() : OntologyId[] {
        return Array.from(this.counts.keys());
    }

    public toMap(): Map<OntologyId, number> {
        return this.counts;
    }
}
