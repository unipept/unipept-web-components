import FunctionalProteinCountTableProcessor from "./../FunctionalProteinCountTableProcessor";
import InterproDefinition, { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import ProteinDefinition from "./../../../ontology/protein/ProteinDefinition";
import { FunctionalNamespace } from "./../../../ontology/functional/FunctionalNamespace";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../../ontology/Ontology";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { InterproResponseCommunicator } from "@/business";
export default class InterproProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<InterproCode, InterproDefinition> {
    private readonly interproCommunicator;
    constructor(peptide: Peptide, equateIl: boolean, interproCommunicator: InterproResponseCommunicator);
    protected getAnnotationsFromProtein(p: ProteinDefinition): InterproCode[];
    protected getNamespaces(): FunctionalNamespace[];
    protected getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>>;
}
