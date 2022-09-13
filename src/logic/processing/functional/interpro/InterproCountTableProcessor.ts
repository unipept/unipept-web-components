import { PeptideData, InterproResponseCommunicator } from "@/logic/communication";
import { InterproCode, InterproDefinition, Peptide, Ontology, InterproNamespace } from "@/logic/ontology";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../../CountTable";
import FunctionalCountTableProcessor from "../FunctionalCountTableProcessor";
import InterproOntologyProcessor from "./InterproOntologyProcessor";

export default class InterproCountTableProcessor extends FunctionalCountTableProcessor<InterproCode, InterproDefinition> {
    constructor(
        readonly peptideCountTable: CountTable<Peptide>,
        readonly pept2data: ShareableMap<Peptide, PeptideData>,
        readonly iprCommunicationSource: InterproResponseCommunicator,
        readonly percentage: number = 5,
    ) {
        super(
            peptideCountTable,
            pept2data,
            percentage,
            "ipr",
            "ipr"
        );
    }

    protected async getOntology(
        countTable: CountTable<InterproCode>
    ): Promise<Ontology<InterproCode, InterproDefinition>> {
        const ontologyProcessor = new InterproOntologyProcessor(this.iprCommunicationSource);
        return await ontologyProcessor.getOntology(countTable);
    }

    protected getNamespaces(): InterproNamespace[] {
        return Object.values(InterproNamespace);
    }
}
