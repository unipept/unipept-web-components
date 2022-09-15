import GoResponseCommunicator from "../../../../logic/communication/functional/go/GoResponseCommunicator";
import FunctionalNamespace from "../../../../logic/ontology/functional/FunctionalNamespace";
import GoCode from "../../../../logic/ontology/functional/go/GoCode";
import GoDefinition from "../../../../logic/ontology/functional/go/GoDefinition";
import Ontology from "../../../../logic/ontology/Ontology";
import Peptide from "../../../../logic/ontology/peptide/Peptide";
import ProteinDefinition from "../../../../logic/ontology/protein/ProteinDefinition";
import CountTable from "../../CountTable";
import FunctionalProteinCountTableProcessor from "../FunctionalProteinCountTableProcessor";
export default class GoProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<GoCode, GoDefinition> {
    private readonly goCommunicator;
    constructor(peptide: Peptide, equateIl: boolean, goCommunicator: GoResponseCommunicator);
    protected getAnnotationsFromProtein(p: ProteinDefinition): GoCode[];
    protected getNamespaces(): FunctionalNamespace[];
    protected getOntology(countTable: CountTable<GoCode>): Promise<Ontology<GoCode, GoDefinition>>;
}
