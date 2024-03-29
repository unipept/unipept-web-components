import EcResponseCommunicator from "../../../../logic/communication/functional/ec/EcResponseCommunicator";
import PeptideData from "../../../../logic/communication/peptide/PeptideData";
import EcCode from "../../../../logic/ontology/functional/ec/EcCode";
import EcDefinition from "../../../../logic/ontology/functional/ec/EcDefinition";
import EcNamespace from "../../../../logic/ontology/functional/ec/EcNamespace";
import Ontology from "../../../../logic/ontology/Ontology";
import Peptide from "../../../../logic/ontology/peptide/Peptide";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../../CountTable";
import FunctionalCountTableProcessor from "../FunctionalCountTableProcessor";
import EcOntologyProcessor from "./EcOntologyProcessor";

/**
 * Generates a count table that maps EC-numbers onto the amount of peptides that are annoted with it. A count table can
 * be requested per namespace.
 *
 * @author Pieter Verschaffelt
 */
 export default class EcCountTableProcessor extends FunctionalCountTableProcessor<EcCode, EcDefinition> {
    constructor(
        readonly peptideCountTable: CountTable<Peptide>,
        readonly pept2data: ShareableMap<Peptide, PeptideData>,
        readonly ecCommunicationSource: EcResponseCommunicator,
        readonly percentage: number = 5
    ) {
        super(
            peptideCountTable,
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
