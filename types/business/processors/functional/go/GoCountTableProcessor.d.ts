import { CountTable } from "./../../../counts/CountTable";
import GoDefinition, { GoCode } from "./../../../ontology/functional/go/GoDefinition";
import { GoNamespace } from "./../../../ontology/functional/go/GoNamespace";
import { Peptide } from "./../../../ontology/raw/Peptide";
import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import FunctionalCountTableProcessor from "./../FunctionalCountTableProcessor";
import { Ontology } from "./../../../ontology/Ontology";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
/**
 * Generates a count table that maps GO-terms onto the amount of peptides that are annotated with this term.
 *
 * @author Pieter Verschaffelt
 */
export default class GoCountTableProcessor extends FunctionalCountTableProcessor<GoCode, GoDefinition> {
    readonly peptideCountTable: CountTable<Peptide>;
    readonly configuration: SearchConfiguration;
    readonly communicationSource: CommunicationSource;
    readonly percentage: number;
    /**
     * @param peptideCountTable The count table from which a GO count table should be constructed.
     * @param configuration The specific search settings that should be used for constructing this table.
     * @param percentage For each sequence in the peptideCountTable, compute relatively how many of all associated
     * proteins are annotated with a specific GO-term. A GO-term will only be included in the resulting GO count table
     * if this calculated percentage is larger than the percentage given.
     */
    constructor(peptideCountTable: CountTable<Peptide>, configuration: SearchConfiguration, communicationSource: CommunicationSource, percentage?: number);
    protected getOntology(countTable: CountTable<GoCode>): Promise<Ontology<GoCode, GoDefinition>>;
    protected getNamespaces(): GoNamespace[];
}
