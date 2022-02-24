import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { CountTable } from "./../../../counts/CountTable";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { EcNamespace } from "./../../../ontology/functional/ec/EcNamespace";
import EcDefinition, { EcCode } from "./../../../ontology/functional/ec/EcDefinition";
import FunctionalCountTableProcessor from "./../FunctionalCountTableProcessor";
import { Ontology } from "./../../../ontology/Ontology";
import EcOntologyProcessor from "./../../../ontology/functional/ec/EcOntologyProcessor";
import { EcResponseCommunicator, PeptideData } from "@/business";
import { ShareableMap } from "shared-memory-datastructures";

/**
 * Generates a count table that maps EC-numbers onto the amount of peptides that are annoted with it. A count table can
 * be requested per namespace.
 *
 * @author Pieter Verschaffelt
 */
export default class EcCountTableProcessor extends FunctionalCountTableProcessor<EcCode, EcDefinition> {
    constructor(
        readonly peptideCountTable: CountTable<Peptide>,
        readonly configuration: SearchConfiguration,
        readonly pept2data: ShareableMap<Peptide, PeptideData>,
        readonly ecCommunicationSource: EcResponseCommunicator,
        readonly percentage: number = 5
    ) {
        super(
            peptideCountTable,
            configuration,
            pept2data,
            percentage,
            "ec",
            "ec"
        );
    }

    protected getNamespaces(): EcNamespace[] {
        return Object.values(EcNamespace);
    }

    protected async getOntology(countTable: CountTable<EcCode>): Promise<Ontology<EcCode, EcDefinition>> {
        const ontologyProcessor = new EcOntologyProcessor(this.ecCommunicationSource);
        return await ontologyProcessor.getOntology(countTable);
    }
}
