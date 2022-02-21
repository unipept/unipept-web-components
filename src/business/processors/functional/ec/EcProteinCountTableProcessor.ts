import FunctionalProteinCountTableProcessor
    from "./../FunctionalProteinCountTableProcessor";
import EcDefinition, { EcCode } from "./../../../ontology/functional/ec/EcDefinition";
import ProteinDefinition from "./../../../ontology/protein/ProteinDefinition";
import { FunctionalNamespace } from "./../../../ontology/functional/FunctionalNamespace";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../../ontology/Ontology";
import { EcNamespace } from "./../../../ontology/functional/ec/EcNamespace";
import EcOntologyProcessor from "./../../../ontology/functional/ec/EcOntologyProcessor";
import { Peptide } from "./../../../ontology/raw/Peptide";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
import { EcResponseCommunicator } from "@/business";

export default class EcProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<EcCode, EcDefinition> {
    constructor(
        peptide: Peptide,
        equateIl: boolean,
        private readonly ecCommunicator: EcResponseCommunicator
    ) {
        super(peptide, equateIl, "EC:")
    }

    protected getAnnotationsFromProtein(p: ProteinDefinition): EcCode[] {
        return p.ecNumbers;
    }

    protected getNamespaces(): FunctionalNamespace[] {
        // @ts-ignore
        return Object.values(EcNamespace) as FunctionalNamespace[];
    }

    protected async getOntology(countTable: CountTable<EcCode>): Promise<Ontology<EcCode, EcDefinition>> {
        const processor = new EcOntologyProcessor(this.ecCommunicator);
        return await processor.getOntology(countTable);
    }
}
