import EcResponseCommunicator from "../../../../logic/communication/functional/ec/EcResponseCommunicator";
import EcCode from "../../../../logic/ontology/functional/ec/EcCode";
import EcDefinition from "../../../../logic/ontology/functional/ec/EcDefinition";
import EcNamespace from "../../../../logic/ontology/functional/ec/EcNamespace";
import FunctionalNamespace from "../../../../logic/ontology/functional/FunctionalNamespace";
import Ontology from "../../../../logic/ontology/Ontology";
import Peptide from "../../../../logic/ontology/peptide/Peptide";
import ProteinDefinition from "../../../../logic/ontology/protein/ProteinDefinition";
import CountTable from "../../CountTable";
import FunctionalProteinCountTableProcessor from "../FunctionalProteinCountTableProcessor";
import EcOntologyProcessor from "./EcOntologyProcessor";

export default class EcProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<EcCode, EcDefinition> {
    constructor(
        peptide: Peptide,
        equateIl: boolean,
        private readonly ecCommunicator: EcResponseCommunicator
    ) {
        super(peptide, equateIl, "EC:")
    }

    protected getAnnotationsFromProtein(p: ProteinDefinition): EcCode[] {
        return p.ecNumbers;
    }

    protected getNamespaces(): FunctionalNamespace[] {
        return Object.values(EcNamespace) as FunctionalNamespace[];
    }

    protected async getOntology(countTable: CountTable<EcCode>): Promise<Ontology<EcCode, EcDefinition>> {
        const processor = new EcOntologyProcessor(this.ecCommunicator);
        return await processor.getOntology(countTable);
    }
}
