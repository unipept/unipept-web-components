import FunctionalDefinition from "./../../ontology/functional/FunctionalDefinition";
import CountTableProcessor from "../CountTableProcessor";
import { FunctionalNamespace } from "./../../ontology/functional/FunctionalNamespace";
import { CountTable } from "./../../counts/CountTable";
import FunctionalTrust from "./FunctionalTrust";
import { Peptide } from "./../../ontology/raw/Peptide";
import ProteinDefinition from "./../../ontology/protein/ProteinDefinition";
import { Ontology, OntologyIdType } from "./../../ontology/Ontology";
export default abstract class FunctionalProteinCountTableProcessor<OntologyId extends OntologyIdType, DefinitionType extends FunctionalDefinition> implements CountTableProcessor<OntologyId> {
    readonly peptide: Peptide;
    readonly equateIl: boolean;
    protected readonly itemPrefix: string;
    private countTables;
    private generalCountTable;
    private trust;
    protected constructor(peptide: Peptide, equateIl: boolean, itemPrefix?: string);
    getCountTable(namespace?: FunctionalNamespace): Promise<CountTable<OntologyId>>;
    getTrust(): Promise<FunctionalTrust>;
    cancel(): void;
    isCancelled(): boolean;
    private compute;
    protected abstract getOntology(countTable: CountTable<OntologyId>): Promise<Ontology<OntologyId, DefinitionType>>;
    protected abstract getAnnotationsFromProtein(p: ProteinDefinition): OntologyId[];
    protected abstract getNamespaces(): FunctionalNamespace[];
}
