import { EcResponseCommunicator } from "@/logic/communication";
import { EcCode, EcDefinition, EcNamespace, FunctionalNamespace, Ontology, Peptide, ProteinDefinition } from "@/logic/ontology";
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
