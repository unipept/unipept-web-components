import PeptideData from "../../../logic/communication/peptide/PeptideData";
import FunctionalCode from "../../../logic/ontology/functional/FunctionalCode";
import FunctionalDefinition from "../../../logic/ontology/functional/FunctionalDefinition";
import FunctionalNamespace from "../../../logic/ontology/functional/FunctionalNamespace";
import Ontology from "../../../logic/ontology/Ontology";
import Peptide from "../../../logic/ontology/peptide/Peptide";
import QueueManager from "../../../logic/util/queue/QueueManager";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../CountTable";
import ProteomicsCountTableProcessor from "../ProteomicsCountTableProcessor";
import FunctionalTrust from "./FunctionalTrust";

export default abstract class FunctionalCountTableProcessor<
    OntologyId extends FunctionalCode,
    DefinitionType extends FunctionalDefinition
> implements ProteomicsCountTableProcessor<OntologyId> {
    public static DEFAULT_FILTER_PERCENTAGE = 5;

    private countTables: Map<FunctionalNamespace, CountTable<OntologyId>> = new Map();

    // Aggregation of all counts over all namespaces
    // @ts-ignore
    private generalCountTable: CountTable<OntologyId>;
    private item2Peptides: Map<OntologyId, Peptide[]> = new Map();
    // @ts-ignore
    private trust: FunctionalTrust;

    /**
     * @param peptideCountTable The peptide count table for which functional count tables must be computed.
     * @param pept2Data Mapping between all unique peptides and the corresponding functional and taxonomic information.
     * @param percentage Threshold for determining if a functional annotation should be included in the output or not.
     * @param peptideData2ProteinCount Property of the PeptideDataResponse object that can be used to extract protein
     * count.
     * @param termPrefix With which string is every functional annotation of the desired type prefixed in the results
     * returned by the Unipept API?
     */
    protected constructor(
        protected readonly peptideCountTable: CountTable<Peptide>,
        protected readonly pept2Data: ShareableMap<Peptide, PeptideData>,
        protected readonly percentage: number = FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE,
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
    public getCountTable(
        namespace?: FunctionalNamespace
    ): CountTable<OntologyId> {
        if (namespace) {
            // @ts-ignore
            return this.countTables.get(namespace);
        } else {
            return this.generalCountTable;
        }
    }

    /**
     * @return A trust-object that describes how many of the given peptides are in fact associated with at least one
     * annotation.
     */
    public getTrust(): FunctionalTrust {
        return this.trust;
    }

    public getAnnotationPeptideMapping(): Map<OntologyId, Peptide[]> {
        return this.item2Peptides;
    }

    /**
     * Do compute both the count table and trust output. Both processing results are stored as part of this object, and
     * can be safely used after this function finishes.
     */
    public async compute(): Promise<void> {
        if (this.countTables.size > 0) {
            return;
        }

        const buffers = this.pept2Data.getBuffers();

        const [countsPerCode, item2Peptides, annotatedCount] = await QueueManager.getLongRunningQueue().pushTask<[
            Map<OntologyId, number>,
            Map<OntologyId, Peptide[]>,
            number
        ], [
            Map<Peptide, number>,
            ArrayBuffer,
            ArrayBuffer,
            number,
            string,
            string
        ]>( "computeFunctionalCountTable", [
            this.peptideCountTable.toMap(),
            buffers[0],
            buffers[1],
            this.percentage,
            this.termPrefix,
            this.peptideData2ProteinCount
        ]);

        this.item2Peptides = item2Peptides;

        // Now fetch all definitions for the terms that we just processed
        const ontology = await this.getOntology(new CountTable<OntologyId>(countsPerCode));

        // We will only keep all of the codes that do also have an associated definition in the static database.
        const toRemove = [];
        for (const [term, counts] of countsPerCode) {
            if (!ontology.getDefinition(term)) {
                toRemove.push(term);
            }
        }

        for (const item of toRemove) {
            countsPerCode.delete(item);
        }

        // Split all the counts per namespace.
        const tablePerNamespace = new Map<FunctionalNamespace, Map<OntologyId, number>>();

        for (const ns of this.getNamespaces()) {
            tablePerNamespace.set(ns, new Map<OntologyId, number>());
        }

        // Add each definition to the count table of it's specific namespace.
        for (const [term, counts] of countsPerCode) {
            const definition = ontology.getDefinition(term);

            if (definition) {
                const nsMap = tablePerNamespace.get(definition.namespace);
                if(nsMap) {
                    nsMap.set(term, counts);
                }
            }
        }

        // Convert the maps to real CountTable-objects.
        for (const [ns, table] of tablePerNamespace) {
            this.countTables.set(ns, new CountTable<OntologyId>(table));
        }
        this.generalCountTable = new CountTable<OntologyId>(countsPerCode);

        this.trust = new FunctionalTrust(annotatedCount, this.peptideCountTable.totalCount);
    }

    protected abstract getOntology(
        countTable: CountTable<OntologyId>
    ): Promise<Ontology<OntologyId, DefinitionType>>;

    protected abstract getNamespaces(): FunctionalNamespace[];
}
