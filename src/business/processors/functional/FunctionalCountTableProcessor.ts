import { CountTable } from "./../../counts/CountTable";
import { Peptide } from "./../../ontology/raw/Peptide";
import FunctionalTrust from "./FunctionalTrust";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import Pept2DataCommunicator from "./../../communication/peptides/Pept2DataCommunicator";
import { PeptideDataResponse } from "./../../communication/peptides/PeptideDataResponse";
import { Ontology } from "./../../ontology/Ontology";
import FunctionalDefinition from "./../../ontology/functional/FunctionalDefinition";
import { FunctionalNamespace } from "./../../ontology/functional/FunctionalNamespace";

export default abstract class FunctionalCountTableProcessor<
    OntologyId,
    DefinitionType extends FunctionalDefinition
> {
    private countTables: Map<FunctionalNamespace, CountTable<OntologyId>>;
    private item2Peptides: Map<OntologyId, Peptide[]>;
    private trust: FunctionalTrust;

    protected constructor(
        protected readonly peptideCountTable: CountTable<Peptide>,
        protected readonly configuration: SearchConfiguration,
        protected readonly percentage: number = 50,
        private readonly peptideData2ProteinCount: (x: PeptideDataResponse) => number,
        private readonly termPrefix: string
    ) {}

    /**
     * Processes the given peptide count table and produces a count table in which every annotation is mapped onto the
     * amount of peptides with which it is annotated.
     *
     * @param namespace For which namespace should the count table be returned? If undefined, a count table
     * for all namespaces will be returned.
     * @return A count table that maps every term that belongs to a peptide from the count table to the amount of
     * peptides in which it was found, taking into account the percentage constraints set in the constructor of this
     * class.
     */
    public async getCountTable(
        namespace?: FunctionalNamespace
    ): Promise<CountTable<OntologyId>> {
        await this.compute();
        return this.countTables.get(namespace);
    }

    /**
     * @return A trust-object that describes how many of the given peptides are in fact associated with at least one
     * annotation.
     */
    public async getTrust(): Promise<FunctionalTrust> {
        await this.compute();
        return this.trust;
    }

    public async getAnnotationPeptideMapping(): Promise<Map<OntologyId, Peptide[]>> {
        await this.compute();
        return this.item2Peptides;
    }

    /**
     * Do compute both the count table and trust output. Both processing results are stored as part of this object, and
     * can be safely used after this function finishes.
     */
    protected async compute(): Promise<void> {
        if (this.countTables.size > 0) {
            return;
        }

        await Pept2DataCommunicator.process(this.peptideCountTable, this.configuration);

        // First we count the amount of peptides per unique GoCode. Afterwards, we can fetch definitions for all these
        // terms and split them on namespace.
        const countsPerCode = new Map<OntologyId, number>();
        // Keeps track of how many peptides are associated with at least one GO-term
        let annotatedCount = 0;

        this.item2Peptides = new Map<OntologyId, Peptide[]>();

        for (const peptide of this.peptideCountTable.getOntologyIds()) {
            const peptideCount = this.peptideCountTable.getCounts(peptide);
            const peptideData = Pept2DataCommunicator.getPeptideResponse(peptide, this.configuration);
            const proteinCount = this.peptideData2ProteinCount(peptideData);

            const uniqueTerms: OntologyId[] = Object.keys(peptideData.fa.data).filter(
                code => code.startsWith(this.termPrefix)
            ) as unknown as OntologyId[];

            for (const term of uniqueTerms) {
                const proteinCountOfTerm: number = peptideData.fa.data[term];
                if ((proteinCountOfTerm / proteinCount) * 100 > this.percentage) {
                    countsPerCode.set(term, (countsPerCode.get(term) || 0) + peptideCount);
                }

                if (!this.item2Peptides.has(term)) {
                    this.item2Peptides.set(term, []);
                }
                this.item2Peptides.get(term).push(peptide);
            }

            if (uniqueTerms.length > 0) {
                annotatedCount++;
            }
        }

        // Now fetch all definitions for the terms that we just processed
        const ontology = await this.getOntology(new CountTable<OntologyId>(countsPerCode));

        // Split all the counts per namespace.
        const tablePerNamespace = new Map<FunctionalNamespace, Map<OntologyId, number>>();

        for (const ns of this.getNamespaces()) {
            tablePerNamespace.set(ns, new Map<OntologyId, number>());
        }

        // Add each definition to the count table of it's specific namespace.
        for (const [term, counts] of countsPerCode) {
            const definition: DefinitionType = ontology.getDefinition(term);
            if (definition) {
                const nsMap = tablePerNamespace.get(definition.namespace);
                nsMap.set(term, counts);
            }
        }

        // Convert the maps to real CountTable-objects.
        for (const [ns, table] of tablePerNamespace) {
            this.countTables.set(ns, new CountTable<OntologyId>(table));
        }

        this.trust = new FunctionalTrust(annotatedCount, this.peptideCountTable.totalCount);
    }

    protected abstract async getOntology(
        countTable: CountTable<OntologyId>
    ): Promise<Ontology<OntologyId, DefinitionType>>;

    protected abstract getNamespaces(): FunctionalNamespace[];
}
