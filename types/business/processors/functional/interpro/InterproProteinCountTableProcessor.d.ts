import FunctionalProteinCountTableProcessor from "./../FunctionalProteinCountTableProcessor";
import InterproDefinition, { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import ProteinDefinition from "./../../../ontology/protein/ProteinDefinition";
import { FunctionalNamespace } from "./../../../ontology/functional/FunctionalNamespace";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../../ontology/Ontology";
import { Peptide } from "./../../../ontology/raw/Peptide";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
export default class InterproProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<InterproCode, InterproDefinition> {
    private readonly communicationSource;
    constructor(peptide: Peptide, equateIl: boolean, communicationSource: CommunicationSource);
    protected getAnnotationsFromProtein(p: ProteinDefinition): InterproCode[];
    protected getNamespaces(): FunctionalNamespace[];
    protected getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>>;
}
