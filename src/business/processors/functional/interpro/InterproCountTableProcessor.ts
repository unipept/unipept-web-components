import FunctionalCountTableProcessor from "./../FunctionalCountTableProcessor";
import InterproDefinition, { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { Ontology } from "./../../../ontology/Ontology";
import InterproOntologyProcessor from "./../../../ontology/functional/interpro/InterproOntologyProcessor";
import { InterproNamespace } from "./../../../ontology/functional/interpro/InterproNamespace";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
import { InterproResponseCommunicator, PeptideData } from "@/business";
import { ShareableMap } from "shared-memory-datastructures";

export default class InterproCountTableProcessor extends FunctionalCountTableProcessor<InterproCode, InterproDefinition> {
    constructor(
        readonly peptideCountTable: CountTable<Peptide>,
        readonly configuration: SearchConfiguration,
        readonly pept2data: ShareableMap<Peptide, PeptideData>,
        readonly iprCommunicationSource: InterproResponseCommunicator,
        readonly percentage: number = 5,
    ) {
        super(
            peptideCountTable,
            configuration,
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
