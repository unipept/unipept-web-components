import { CountTable } from "./../../counts/CountTable";
import { Peptide } from "./../../ontology/raw/Peptide";
import FunctionalTrust from "./FunctionalTrust";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import Pept2DataCommunicator from "./../../communication/peptides/Pept2DataCommunicator";
import { Ontology, OntologyIdType } from "./../../ontology/Ontology";
import FunctionalDefinition from "./../../ontology/functional/FunctionalDefinition";
import { FunctionalNamespace } from "./../../ontology/functional/FunctionalNamespace";
import ProteomicsCountTableProcessor from "./../ProteomicsCountTableProcessor";
import { spawn, Worker, Pool } from "threads";
import CommunicationSource from "./../../communication/source/CommunicationSource";

export default abstract class FunctionalCountTableProcessor<
    OntologyId extends OntologyIdType,
    DefinitionType extends FunctionalDefinition
> implements ProteomicsCountTableProcessor<OntologyId> {
    private countTables: Map<FunctionalNamespace, CountTable<OntologyId>> = new Map();
    // Aggregation of all counts over all namespaces
    private generalCountTable: CountTable<OntologyId>;
    private item2Peptides: Map<OntologyId, Peptide[]> = new Map();
    private trust: FunctionalTrust;

    /**
     * @param peptideCountTable The peptide count table for which functional count tables must be computed.
     * @param configuration The search configuration that should be applied while processing the peptides.
     * @param percentage Threshold for determining if a functional annotation should be included in the output or not.
     * @param peptideData2ProteinCount Property of the PeptideDataResponse object that can be used to extract protein
     * count.
     * @param termPrefix With which string is every functional annotation of the desired type prefixed in the results
     * returned by the Unipept API?
     */
    protected constructor(
        protected readonly peptideCountTable: CountTable<Peptide>,
        protected readonly configuration: SearchConfiguration,
        protected readonly communicationSource: CommunicationSource,
        protected readonly percentage: number = 50,
        private readonly peptideData2ProteinCount: string,
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
        if (namespace) {
            return this.countTables.get(namespace);
        } else {
            return this.generalCountTable;
        }
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

        const pept2DataCommunicator = this.communicationSource.getPept2DataCommunicator();
        await pept2DataCommunicator.process(this.peptideCountTable, this.configuration);

        let start = new Date().getTime();
        const worker = await spawn(new Worker("./FunctionalCountTableProcessor.worker.ts"));
        let [countsPerCode, item2Peptides, annotatedCount] = await worker.compute(
            this.peptideCountTable.toMap(),
            pept2DataCommunicator.getPeptideResponseMap(this.configuration),
            this.percentage,
            this.termPrefix,
            this.peptideData2ProteinCount
        );

        let end = new Date().getTime();
        console.log("Functional count table worker took " + (end - start) / 1000 + "s");
        start = new Date().getTime();
        this.item2Peptides = item2Peptides;

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
        this.generalCountTable = new CountTable<OntologyId>(countsPerCode);

        this.trust = new FunctionalTrust(annotatedCount, this.peptideCountTable.totalCount);

        end = new Date().getTime();
        console.log("Functional count table (non-worker) took " + (end - start) / 1000 + "s");
    }

    protected abstract async getOntology(
        countTable: CountTable<OntologyId>
    ): Promise<Ontology<OntologyId, DefinitionType>>;

    protected abstract getNamespaces(): FunctionalNamespace[];
}
