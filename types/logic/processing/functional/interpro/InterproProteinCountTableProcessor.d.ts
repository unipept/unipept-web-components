import { InterproResponseCommunicator } from "@/logic/communication";
import { InterproCode, InterproDefinition, Peptide, ProteinDefinition, FunctionalNamespace, Ontology } from "@/logic/ontology";
import CountTable from "../../CountTable";
import FunctionalProteinCountTableProcessor from "../FunctionalProteinCountTableProcessor";
export default class InterproProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<InterproCode, InterproDefinition> {
    private readonly interproCommunicator;
    constructor(peptide: Peptide, equateIl: boolean, interproCommunicator: InterproResponseCommunicator);
    protected getAnnotationsFromProtein(p: ProteinDefinition): InterproCode[];
    protected getNamespaces(): FunctionalNamespace[];
    protected getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>>;
}
