import { GoResponseCommunicator } from "@/logic/communication";
import { GoCode, GoDefinition, Peptide, ProteinDefinition, FunctionalNamespace, Ontology } from "@/logic/ontology";
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
        // @ts-ignore
        return Object.values(GoNamespace) as FunctionalNamespace[];
    }

    protected async getOntology(countTable: CountTable<GoCode>): Promise<Ontology<GoCode, GoDefinition>> {
        const ontologyProcessor = new GoOntologyProcessor(this.goCommunicator);
        return await ontologyProcessor.getOntology(countTable);
    }
}
