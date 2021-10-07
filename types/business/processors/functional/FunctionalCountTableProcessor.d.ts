import { OntologyIdType } from "./../../ontology/Ontology";
import { ShareableMap } from "shared-memory-datastructures";
import { CountTable, Peptide, FunctionalTrust, SearchConfiguration, Ontology, FunctionalDefinition, FunctionalNamespace, ProteomicsCountTableProcessor, PeptideData } from "@/business";
export default abstract class FunctionalCountTableProcessor<OntologyId extends OntologyIdType, DefinitionType extends FunctionalDefinition> implements ProteomicsCountTableProcessor<OntologyId> {
    protected readonly peptideCountTable: CountTable<Peptide>;
    protected readonly configuration: SearchConfiguration;
    protected readonly pept2Data: ShareableMap<Peptide, PeptideData>;
    protected readonly percentage: number;
    private readonly peptideData2ProteinCount;
    private readonly termPrefix;
    static DEFAULT_FILTER_PERCENTAGE: number;
    private countTables;
    private generalCountTable;
    private item2Peptides;
    private trust;
    /**
     * @param peptideCountTable The peptide count table for which functional count tables must be computed.
     * @param configuration The search configuration that should be applied while processing the peptides.
     * @param pept2Data Mapping between all unique peptides and the corresponding functional and taxonomic information.
     * @param percentage Threshold for determining if a functional annotation should be included in the output or not.
     * @param peptideData2ProteinCount Property of the PeptideDataResponse object that can be used to extract protein
     * count.
     * @param termPrefix With which string is every functional annotation of the desired type prefixed in the results
     * returned by the Unipept API?
     */
    protected constructor(peptideCountTable: CountTable<Peptide>, configuration: SearchConfiguration, pept2Data: ShareableMap<Peptide, PeptideData>, percentage: number, peptideData2ProteinCount: string, termPrefix: string);
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
    getCountTable(namespace?: FunctionalNamespace): CountTable<OntologyId>;
    cancel(): Promise<void>;
    isCancelled(): boolean;
    /**
     * @return A trust-object that describes how many of the given peptides are in fact associated with at least one
     * annotation.
     */
    getTrust(): Promise<FunctionalTrust>;
    getAnnotationPeptideMapping(): Map<OntologyId, Peptide[]>;
    /**
     * Do compute both the count table and trust output. Both processing results are stored as part of this object, and
     * can be safely used after this function finishes.
     */
    compute(): Promise<void>;
    protected abstract getOntology(countTable: CountTable<OntologyId>): Promise<Ontology<OntologyId, DefinitionType>>;
    protected abstract getNamespaces(): FunctionalNamespace[];
}
