import { GoResponseCommunicator } from "@/logic/communication";
import { GoCode, GoDefinition, Peptide, ProteinDefinition, FunctionalNamespace, Ontology } from "@/logic/ontology";
import CountTable from "../../CountTable";
import FunctionalProteinCountTableProcessor from "../FunctionalProteinCountTableProcessor";
export default class GoProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<GoCode, GoDefinition> {
    private readonly goCommunicator;
    constructor(peptide: Peptide, equateIl: boolean, goCommunicator: GoResponseCommunicator);
    protected getAnnotationsFromProtein(p: ProteinDefinition): GoCode[];
    protected getNamespaces(): FunctionalNamespace[];
    protected getOntology(countTable: CountTable<GoCode>): Promise<Ontology<GoCode, GoDefinition>>;
}
