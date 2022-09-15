import InterproResponseCommunicator from "../../../../logic/communication/functional/interpro/InterproResponseCommunicator";
import PeptideData from "../../../../logic/communication/peptide/PeptideData";
import InterproCode from "../../../../logic/ontology/functional/interpro/InterproCode";
import InterproDefinition from "../../../../logic/ontology/functional/interpro/InterproDefinition";
import InterproNamespace from "../../../../logic/ontology/functional/interpro/InterproNamespace";
import Ontology from "../../../../logic/ontology/Ontology";
import Peptide from "../../../../logic/ontology/peptide/Peptide";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../../CountTable";
import FunctionalCountTableProcessor from "../FunctionalCountTableProcessor";
import InterproOntologyProcessor from "./InterproOntologyProcessor";

export default class InterproCountTableProcessor extends FunctionalCountTableProcessor<InterproCode, InterproDefinition> {
    constructor(
        readonly peptideCountTable: CountTable<Peptide>,
        readonly pept2data: ShareableMap<Peptide, PeptideData>,
        readonly iprCommunicationSource: InterproResponseCommunicator,
        readonly percentage: number = 5,
    ) {
        super(
            peptideCountTable,
            pept2data,
            percentage,
            "ipr",
            "ipr"
        );
    }

    protected async getOntology(
        countTable: CountTable<InterproCode>
    ): Promise<Ontology<InterproCode, InterproDefinition>> {
        const ontologyProcessor = new InterproOntologyProcessor(this.iprCommunicationSource);
        return await ontologyProcessor.getOntology(countTable);
    }

    protected getNamespaces(): InterproNamespace[] {
        return Object.values(InterproNamespace);
    }
}
