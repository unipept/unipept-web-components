type Peptide = string;

export type Count = number;

export abstract class CountTable<Ontology, OntologyId> {
    readonly totalCount;

    constructor(
        readonly counts: Map<OntologyId, Count>,
        readonly ontology2peptide: Map<OntologyId, Set<Peptide>> = undefined, 
        readonly peptide2ontology: Map<Peptide, OntologyId[]> = undefined
    ) {
        let ontologyCounts = [...counts.values()];
        this.totalCount = ontologyCounts.length? [...counts.values()].reduce((a, b) => a + b) : 0;
        
        // Reverse ontology2peptide here
        if (peptide2ontology === undefined && ontology2peptide !== undefined) {
            this.peptide2ontology = new Map<Peptide, OntologyId[]>();
            for (const [id, peptides] of ontology2peptide.entries()) {
                for (const peptide of peptides) {
                    if (!this.peptide2ontology.has(peptide)) {
                        this.peptide2ontology.set(peptide, []);
                    }

                    this.peptide2ontology.get(peptide).push(id);
                }
            }
        }
    }

    getOntologyIds() : OntologyId[] {
        return Array.from(this.counts.keys());
    }

    abstract getOntology() : Ontology;
}
