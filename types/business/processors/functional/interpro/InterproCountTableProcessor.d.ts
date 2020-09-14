import FunctionalCountTableProcessor from "./../FunctionalCountTableProcessor";
import InterproDefinition, { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { Ontology } from "./../../../ontology/Ontology";
import { InterproNamespace } from "./../../../ontology/functional/interpro/InterproNamespace";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
export default class InterproCountTableProcessor extends FunctionalCountTableProcessor<InterproCode, InterproDefinition> {
    readonly peptideCountTable: CountTable<Peptide>;
    readonly configuration: SearchConfiguration;
    readonly communicationSource: CommunicationSource;
    readonly percentage: number;
    constructor(peptideCountTable: CountTable<Peptide>, configuration: SearchConfiguration, communicationSource: CommunicationSource, percentage?: number);
    protected getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>>;
    protected getNamespaces(): InterproNamespace[];
}
