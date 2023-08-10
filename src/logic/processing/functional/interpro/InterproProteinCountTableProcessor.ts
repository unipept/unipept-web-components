import InterproResponseCommunicator from "../../../../logic/communication/functional/interpro/InterproResponseCommunicator";
import FunctionalNamespace from "../../../../logic/ontology/functional/FunctionalNamespace";
import InterproCode from "../../../../logic/ontology/functional/interpro/InterproCode";
import InterproDefinition from "../../../../logic/ontology/functional/interpro/InterproDefinition";
import InterproNamespace from "../../../../logic/ontology/functional/interpro/InterproNamespace";
import Ontology from "../../../../logic/ontology/Ontology";
import Peptide from "../../../../logic/ontology/peptide/Peptide";
import ProteinDefinition from "../../../../logic/ontology/protein/ProteinDefinition";
import CountTable from "../../CountTable";
import FunctionalProteinCountTableProcessor from "../FunctionalProteinCountTableProcessor";
import InterproOntologyProcessor from "./InterproOntologyProcessor";

export default class InterproProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<InterproCode, InterproDefinition> {
    constructor(
        peptide: Peptide,
        equateIl: boolean,
        private readonly interproCommunicator: InterproResponseCommunicator
    ) {
        super(peptide, equateIl, "IPR:")
    }

    protected getAnnotationsFromProtein(p: ProteinDefinition): InterproCode[] {
        return p.interproEntries;
    }

    protected getNamespaces(): FunctionalNamespace[] {
        return Object.values(InterproNamespace) as FunctionalNamespace[];
    }

    protected async getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>> {
        const processor = new InterproOntologyProcessor(this.interproCommunicator);
        return await processor.getOntology(countTable);
    }
}
