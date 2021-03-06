import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { CountTable } from "./../../../counts/CountTable";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { EcNamespace } from "./../../../ontology/functional/ec/EcNamespace";
import EcDefinition, { EcCode } from "./../../../ontology/functional/ec/EcDefinition";
import FunctionalCountTableProcessor from "./../FunctionalCountTableProcessor";
import { Ontology } from "./../../../ontology/Ontology";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
/**
 * Generates a count table that maps EC-numbers onto the amount of peptides that are annoted with it. A count table can
 * be requested per namespace.
 *
 * @author Pieter Verschaffelt
 */
export default class EcCountTableProcessor extends FunctionalCountTableProcessor<EcCode, EcDefinition> {
    readonly peptideCountTable: CountTable<Peptide>;
    readonly configuration: SearchConfiguration;
    readonly communicationSource: CommunicationSource;
    readonly percentage: number;
    constructor(peptideCountTable: CountTable<Peptide>, configuration: SearchConfiguration, communicationSource: CommunicationSource, percentage?: number);
    protected getNamespaces(): EcNamespace[];
    protected getOntology(countTable: CountTable<EcCode>): Promise<Ontology<EcCode, EcDefinition>>;
}
