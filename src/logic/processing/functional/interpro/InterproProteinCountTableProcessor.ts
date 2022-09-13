import { InterproResponseCommunicator } from "@/logic/communication";
import { InterproCode, InterproDefinition, Peptide, ProteinDefinition, FunctionalNamespace, Ontology, InterproNamespace } from "@/logic/ontology";
import CountTable from "../../CountTable";
import FunctionalProteinCountTableProcessor from "../FunctionalProteinCountTableProcessor";
import InterproOntologyProcessor from "./InterproOntologyProcessor";

export default class InterproProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<InterproCode, InterproDefinition> {
    constructor(
        peptide: Peptide,
        equateIl: boolean,
        private readonly interproCommunicator: InterproResponseCommunicator
    ) {
        super(peptide, equateIl, "IPR:")
    }

    protected getAnnotationsFromProtein(p: ProteinDefinition): InterproCode[] {
        return p.interproEntries;
    }

    protected getNamespaces(): FunctionalNamespace[] {
        return Object.values(InterproNamespace) as FunctionalNamespace[];
    }

    protected async getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>> {
        const processor = new InterproOntologyProcessor(this.interproCommunicator);
        return await processor.getOntology(countTable);
    }
}
