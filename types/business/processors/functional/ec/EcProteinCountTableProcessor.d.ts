import FunctionalProteinCountTableProcessor from "./../FunctionalProteinCountTableProcessor";
import EcDefinition, { EcCode } from "./../../../ontology/functional/ec/EcDefinition";
import ProteinDefinition from "./../../../ontology/protein/ProteinDefinition";
import { FunctionalNamespace } from "./../../../ontology/functional/FunctionalNamespace";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../../ontology/Ontology";
import { Peptide } from "./../../../ontology/raw/Peptide";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
export default class EcProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<EcCode, EcDefinition> {
    private readonly communicationSource;
    constructor(peptide: Peptide, equateIl: boolean, communicationSource: CommunicationSource);
    protected getAnnotationsFromProtein(p: ProteinDefinition): EcCode[];
    protected getNamespaces(): FunctionalNamespace[];
    protected getOntology(countTable: CountTable<EcCode>): Promise<Ontology<EcCode, EcDefinition>>;
}
