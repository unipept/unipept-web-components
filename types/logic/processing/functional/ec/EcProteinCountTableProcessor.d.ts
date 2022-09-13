import { EcResponseCommunicator } from "@/logic/communication";
import { EcCode, EcDefinition, FunctionalNamespace, Ontology, Peptide, ProteinDefinition } from "@/logic/ontology";
import CountTable from "../../CountTable";
import FunctionalProteinCountTableProcessor from "../FunctionalProteinCountTableProcessor";
export default class EcProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<EcCode, EcDefinition> {
    private readonly ecCommunicator;
    constructor(peptide: Peptide, equateIl: boolean, ecCommunicator: EcResponseCommunicator);
    protected getAnnotationsFromProtein(p: ProteinDefinition): EcCode[];
    protected getNamespaces(): FunctionalNamespace[];
    protected getOntology(countTable: CountTable<EcCode>): Promise<Ontology<EcCode, EcDefinition>>;
}
