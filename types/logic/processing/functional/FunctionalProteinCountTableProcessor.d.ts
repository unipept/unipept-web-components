import { FunctionalDefinition, FunctionalNamespace, Ontology, Peptide } from "@/logic/ontology";
import OntologyCode from "@/logic/ontology/OntologyCode";
import { ProteinDefinition } from "@/logic/ontology/protein";
import CountTable from "../CountTable";
import CountTableProcessor from "../CountTableProcessor";
import { ProteinProcessor } from "../protein";
import FunctionalTrust from "./FunctionalTrust";
export default abstract class FunctionalProteinCountTableProcessor<OntologyId extends OntologyCode, DefinitionType extends FunctionalDefinition> implements CountTableProcessor<OntologyId> {
    readonly peptide: Peptide;
    readonly equateIl: boolean;
    protected readonly itemPrefix: string;
    private countTables;
    private generalCountTable;
    private trust;
    protected constructor(peptide: Peptide, equateIl: boolean, itemPrefix?: string);
    getCountTable(namespace?: FunctionalNamespace): CountTable<OntologyId> | undefined;
    getTrust(): FunctionalTrust | undefined;
    isCancelled(): boolean;
    compute(proteinProcessor: ProteinProcessor): Promise<void>;
    protected abstract getOntology(countTable: CountTable<OntologyId>): Promise<Ontology<OntologyId, DefinitionType>>;
    protected abstract getAnnotationsFromProtein(p: ProteinDefinition): OntologyId[];
    protected abstract getNamespaces(): FunctionalNamespace[];
}
