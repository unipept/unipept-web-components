import GoResponseCommunicator from "../../../../logic/communication/functional/go/GoResponseCommunicator";
import FunctionalNamespace from "../../../../logic/ontology/functional/FunctionalNamespace";
import GoCode from "../../../../logic/ontology/functional/go/GoCode";
import GoDefinition from "../../../../logic/ontology/functional/go/GoDefinition";
import GoNamespace from "../../../../logic/ontology/functional/go/GoNamespace";
import Ontology from "../../../../logic/ontology/Ontology";
import Peptide from "../../../../logic/ontology/peptide/Peptide";
import ProteinDefinition from "../../../../logic/ontology/protein/ProteinDefinition";
import CountTable from "../../CountTable";
import FunctionalProteinCountTableProcessor from "../FunctionalProteinCountTableProcessor";
import GoOntologyProcessor from "./GoOntologyProcessor";

export default class GoProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<GoCode, GoDefinition>{
    constructor(
        peptide: Peptide,
        equateIl: boolean,
        private readonly goCommunicator: GoResponseCommunicator
    ) {
        super(peptide, equateIl);
    }

    protected getAnnotationsFromProtein(p: ProteinDefinition): GoCode[] {
        return p.goTerms;
    }

    protected getNamespaces(): FunctionalNamespace[] {
        return Object.values(GoNamespace) as FunctionalNamespace[];
    }

    protected async getOntology(countTable: CountTable<GoCode>): Promise<Ontology<GoCode, GoDefinition>> {
        const ontologyProcessor = new GoOntologyProcessor(this.goCommunicator);
        return await ontologyProcessor.getOntology(countTable);
    }
}
