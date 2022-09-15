import InterproResponseCommunicator from "../../../../logic/communication/functional/interpro/InterproResponseCommunicator";
import FunctionalNamespace from "../../../../logic/ontology/functional/FunctionalNamespace";
import InterproCode from "../../../../logic/ontology/functional/interpro/InterproCode";
import InterproDefinition from "../../../../logic/ontology/functional/interpro/InterproDefinition";
import Ontology from "../../../../logic/ontology/Ontology";
import Peptide from "../../../../logic/ontology/peptide/Peptide";
import ProteinDefinition from "../../../../logic/ontology/protein/ProteinDefinition";
import CountTable from "../../CountTable";
import FunctionalProteinCountTableProcessor from "../FunctionalProteinCountTableProcessor";
export default class InterproProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<InterproCode, InterproDefinition> {
    private readonly interproCommunicator;
    constructor(peptide: Peptide, equateIl: boolean, interproCommunicator: InterproResponseCommunicator);
    protected getAnnotationsFromProtein(p: ProteinDefinition): InterproCode[];
    protected getNamespaces(): FunctionalNamespace[];
    protected getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>>;
}
