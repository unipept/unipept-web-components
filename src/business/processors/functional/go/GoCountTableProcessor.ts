import { CountTable } from "@/business/counts/CountTable";
import GoDefinition, { GoCode } from "@/business/ontology/functional/go/GoDefinition";
import FunctionalTrust from "@/business/processors/functional/FunctionalTrust";
import { GoNamespace } from "@/business/ontology/functional/go/GoNamespace";
import Pept2DataCommunicator from "@/business/communication/peptides/Pept2DataCommunicator";
import { Peptide } from "@/business/ontology/raw/Peptide";
import GoOntologyProcessor from "@/business/ontology/functional/go/GoOntologyProcessor";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";

/**
 * Generates a count table that maps GO-terms onto the amount of peptides that are annotated with this term.
 *
 * @author Pieter Verschaffelt
 */
export default class GoCountTableProcessor {
    private goCountTables: Map<GoNamespace, CountTable<GoCode>>;
    private go2Peptides: Map<GoCode, Peptide[]>;
    private trust: FunctionalTrust;

    /**
     * @param peptideCountTable The count table from which a GO count table should be constructed.
     * @param configuration The specific search settings that should be used for constructing this table.
     * @param percentage For each sequence in the peptideCountTable, compute relatively how many of all associated
     * proteins are annotated with a specific GO-term. A GO-term will only be included in the resulting GO count table
     * if this calculated percentage is larger than the percentage given.
     * sequence).
     */
    constructor(
        private readonly peptideCountTable: CountTable<Peptide>,
        private readonly configuration: SearchConfiguration,
        private readonly percentage: number = 50
    ) {}

    /**
     * Processes the given peptide count table and produces a count table in which every GO-term is mapped onto the
     * amount of peptides with which it is annotated.
     *
     * @param namespace For which GO-namespace should the count table be returned? If undefined, a count table for all
     * namespaces will be returned.
     * @return A count table that maps every GO-term that belongs to a peptide from the count table to the amount of
     * peptides in which it was found, taking into account the percentage constraints set in the constructor of this
     * class.
     */
    public async getCountTable(
        namespace?: GoNamespace
    ): Promise<CountTable<GoCode>> {
        await this.compute();
        return this.goCountTables.get(namespace);
    }

    /**
     * @return A trust-object that describes how many of the given peptides are in fact associated with at least one
     * GO-term.
     */
    public async getTrust(): Promise<FunctionalTrust> {
        await this.compute();
        return this.trust;
    }

    public async getGoPeptideMapping(): Promise<Map<GoCode, Peptide[]>> {
        await this.compute();
        return this.go2Peptides;
    }

    /**
     * Do compute both the count table and trust output. Both processing results are stored as part of this object, and
     * can be safely used after this function finishes.
     */
    protected async compute(): Promise<void> {
        if (this.goCountTables.size > 0) {
            return;
        }

        await Pept2DataCommunicator.process(this.peptideCountTable, this.configuration);

        // First we count the amount of peptides per unique GoCode. Afterwards, we can fetch definitions for all these
        // terms and split them on namespace.
        const countsPerCode = new Map<GoCode, number>();
        // Keeps track of how many peptides are associated with at least one GO-term
        let annotatedCount = 0;

        this.go2Peptides = new Map<GoCode, Peptide[]>();

        for (const peptide of this.peptideCountTable.getOntologyIds()) {
            const peptideCount = this.peptideCountTable.getCounts(peptide);
            const peptideData = Pept2DataCommunicator.getPeptideResponse(peptide, this.configuration);
            const proteinCount = peptideData.fa.counts.GO;

            const uniqueGoTerms: GoCode[] = Object.keys(peptideData.fa.data).filter(code => code.startsWith("GO:"));

            for (const goTermCode of uniqueGoTerms) {
                const proteinCountOfTerm: number = peptideData.fa.data[goTermCode];
                if ((proteinCountOfTerm / proteinCount) * 100 > this.percentage) {
                    countsPerCode.set(goTermCode, (countsPerCode.get(goTermCode) || 0) + peptideCount);
                }

                if (!this.go2Peptides.has(goTermCode)) {
                    this.go2Peptides.set(goTermCode, []);
                }
                this.go2Peptides.get(goTermCode).push(peptide);
            }

            if (uniqueGoTerms.length > 0) {
                annotatedCount++;
            }
        }

        // Now fetch all definitions for the terms that we just processed
        const goOntologyProcessor = new GoOntologyProcessor();
        const ontology = await goOntologyProcessor.getOntology(new CountTable<GoCode>(countsPerCode));

        // Split all the counts per namespace.
        const tablePerNamespace = new Map<GoNamespace, Map<GoCode, number>>();

        for (const ns of Object.values(GoNamespace)) {
            tablePerNamespace.set(ns, new Map<GoCode, number>());
        }

        // Add each definition to the count table of it's specific namespace.
        for (const [term, counts] of countsPerCode) {
            const definition: GoDefinition = ontology.getDefinition(term);
            if (definition) {
                const nsMap = tablePerNamespace.get(definition.namespace);
                nsMap.set(term, counts);
            }
        }

        // Convert the maps to real CountTable-objects.
        for (const [ns, table] of tablePerNamespace) {
            this.goCountTables.set(ns, new CountTable<GoCode>(table));
        }

        this.trust = new FunctionalTrust(annotatedCount, this.peptideCountTable.totalCount);
    }
}
