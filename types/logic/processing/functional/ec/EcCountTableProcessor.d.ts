import { EcResponseCommunicator, PeptideData } from "@/logic/communication";
import { EcCode, EcDefinition, EcNamespace, Ontology, Peptide } from "@/logic/ontology";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../../CountTable";
import FunctionalCountTableProcessor from "../FunctionalCountTableProcessor";
/**
 * Generates a count table that maps EC-numbers onto the amount of peptides that are annoted with it. A count table can
 * be requested per namespace.
 *
 * @author Pieter Verschaffelt
 */
export default class EcCountTableProcessor extends FunctionalCountTableProcessor<EcCode, EcDefinition> {
    readonly peptideCountTable: CountTable<Peptide>;
    readonly pept2data: ShareableMap<Peptide, PeptideData>;
    readonly ecCommunicationSource: EcResponseCommunicator;
    readonly percentage: number;
    constructor(peptideCountTable: CountTable<Peptide>, pept2data: ShareableMap<Peptide, PeptideData>, ecCommunicationSource: EcResponseCommunicator, percentage?: number);
    protected getNamespaces(): EcNamespace[];
    protected getOntology(countTable: CountTable<EcCode>): Promise<Ontology<EcCode, EcDefinition>>;
}
