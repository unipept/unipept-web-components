import FunctionalProteinCountTableProcessor
    from "./../FunctionalProteinCountTableProcessor";
import InterproDefinition, { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import ProteinDefinition from "./../../../ontology/protein/ProteinDefinition";
import { FunctionalNamespace } from "./../../../ontology/functional/FunctionalNamespace";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../../ontology/Ontology";
import { InterproNamespace } from "./../../../ontology/functional/interpro/InterproNamespace";
import InterproOntologyProcessor from "./../../..//ontology/functional/interpro/InterproOntologyProcessor";
import { Peptide } from "./../../../ontology/raw/Peptide";
import CommunicationSource from "./../../../communication/source/CommunicationSource";

export default class InterproProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<InterproCode, InterproDefinition> {
    constructor(
        peptide: Peptide,
        equateIl: boolean,
        private readonly communicationSource: CommunicationSource
    ) {
        super(peptide, equateIl, "IPR:")
    }

    protected getAnnotationsFromProtein(p: ProteinDefinition): InterproCode[] {
        return p.interproEntries;
    }

    protected getNamespaces(): FunctionalNamespace[] {
        return Object.values(InterproNamespace);
    }

    protected async getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>> {
        const processor = new InterproOntologyProcessor(this.communicationSource);
        return await processor.getOntology(countTable);
    }

}
