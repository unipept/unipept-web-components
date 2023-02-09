import GoResponseCommunicator from "../../../../logic/communication/functional/go/GoResponseCommunicator";
import PeptideData from "../../../../logic/communication/peptide/PeptideData";
import GoCode from "../../../../logic/ontology/functional/go/GoCode";
import GoDefinition from "../../../../logic/ontology/functional/go/GoDefinition";
import GoNamespace from "../../../../logic/ontology/functional/go/GoNamespace";
import Ontology from "../../../../logic/ontology/Ontology";
import Peptide from "../../../../logic/ontology/peptide/Peptide";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../../CountTable";
import FunctionalCountTableProcessor from "../FunctionalCountTableProcessor";
import GoOntologyProcessor from "./GoOntologyProcessor";

/**
 * Generates a count table that maps GO-terms onto the amount of peptides that are annotated with this term.
 *
 * @author Pieter Verschaffelt
 */
 export default class GoCountTableProcessor extends FunctionalCountTableProcessor<GoCode, GoDefinition> {
    /**
     * @param peptideCountTable The count table from which a GO count table should be constructed.
     * @param configuration The specific search settings that should be used for constructing this table.
     * @param pept2Data Mapping between all unique peptides and the corresponding functional and taxonomic information.
     * @param goCommunicationSource A communication source that allows us to easily retrieve
     * @param percentage For each sequence in the peptideCountTable, compute relatively how many of all associated
     * proteins are annotated with a specific GO-term. A GO-term will only be included in the resulting GO count table
     * if this calculated percentage is larger than the percentage given.
     */
    constructor(
        readonly peptideCountTable: CountTable<Peptide>,
        readonly pept2Data: ShareableMap<Peptide, PeptideData>,
        readonly goCommunicationSource: GoResponseCommunicator,
        readonly percentage: number = 5
    ) {
        super(
            peptideCountTable,
            pept2Data,
            percentage,
            "go",
            "go"
        );
    }

    protected async getOntology(countTable: CountTable<GoCode>): Promise<Ontology<GoCode, GoDefinition>> {
        const ontologyProcessor = new GoOntologyProcessor(this.goCommunicationSource);
        return await ontologyProcessor.getOntology(countTable);
    }

    protected getNamespaces(): GoNamespace[] {
        return Object.values(GoNamespace);
    }
}
