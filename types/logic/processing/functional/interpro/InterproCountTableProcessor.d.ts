import { PeptideData, InterproResponseCommunicator } from "@/logic/communication";
import { InterproCode, InterproDefinition, Peptide, Ontology, InterproNamespace } from "@/logic/ontology";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../../CountTable";
import FunctionalCountTableProcessor from "../FunctionalCountTableProcessor";
export default class InterproCountTableProcessor extends FunctionalCountTableProcessor<InterproCode, InterproDefinition> {
    readonly peptideCountTable: CountTable<Peptide>;
    readonly pept2data: ShareableMap<Peptide, PeptideData>;
    readonly iprCommunicationSource: InterproResponseCommunicator;
    readonly percentage: number;
    constructor(peptideCountTable: CountTable<Peptide>, pept2data: ShareableMap<Peptide, PeptideData>, iprCommunicationSource: InterproResponseCommunicator, percentage?: number);
    protected getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>>;
    protected getNamespaces(): InterproNamespace[];
}
