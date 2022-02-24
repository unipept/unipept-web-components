import FunctionalCountTableProcessor from "./../FunctionalCountTableProcessor";
import InterproDefinition, { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { Ontology } from "./../../../ontology/Ontology";
import { InterproNamespace } from "./../../../ontology/functional/interpro/InterproNamespace";
import { InterproResponseCommunicator, PeptideData } from "@/business";
import { ShareableMap } from "shared-memory-datastructures";
export default class InterproCountTableProcessor extends FunctionalCountTableProcessor<InterproCode, InterproDefinition> {
    readonly peptideCountTable: CountTable<Peptide>;
    readonly configuration: SearchConfiguration;
    readonly pept2data: ShareableMap<Peptide, PeptideData>;
    readonly iprCommunicationSource: InterproResponseCommunicator;
    readonly percentage: number;
    constructor(peptideCountTable: CountTable<Peptide>, configuration: SearchConfiguration, pept2data: ShareableMap<Peptide, PeptideData>, iprCommunicationSource: InterproResponseCommunicator, percentage?: number);
    protected getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>>;
    protected getNamespaces(): InterproNamespace[];
}
