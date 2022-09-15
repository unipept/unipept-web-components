import EcResponseCommunicator from "../../../../logic/communication/functional/ec/EcResponseCommunicator";
import EcCode from "../../../../logic/ontology/functional/ec/EcCode";
import EcDefinition from "../../../../logic/ontology/functional/ec/EcDefinition";
import FunctionalNamespace from "../../../../logic/ontology/functional/FunctionalNamespace";
import Ontology from "../../../../logic/ontology/Ontology";
import Peptide from "../../../../logic/ontology/peptide/Peptide";
import ProteinDefinition from "../../../../logic/ontology/protein/ProteinDefinition";
import CountTable from "../../CountTable";
import FunctionalProteinCountTableProcessor from "../FunctionalProteinCountTableProcessor";
export default class EcProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<EcCode, EcDefinition> {
    private readonly ecCommunicator;
    constructor(peptide: Peptide, equateIl: boolean, ecCommunicator: EcResponseCommunicator);
    protected getAnnotationsFromProtein(p: ProteinDefinition): EcCode[];
    protected getNamespaces(): FunctionalNamespace[];
    protected getOntology(countTable: CountTable<EcCode>): Promise<Ontology<EcCode, EcDefinition>>;
}
