import FunctionalProteinCountTableProcessor
    from "./../FunctionalProteinCountTableProcessor";
import InterproDefinition, { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import ProteinDefinition from "./../../../ontology/protein/ProteinDefinition";
import { FunctionalNamespace } from "./../../../ontology/functional/FunctionalNamespace";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../../ontology/Ontology";
import { InterproNamespace } from "@/business/ontology/functional/interpro/InterproNamespace";
import InterproOntologyProcessor from "@/business/ontology/functional/interpro/InterproOntologyProcessor";

export default class InterproProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<InterproCode, InterproDefinition> {
    protected getAnnotationsFromProtein(p: ProteinDefinition): InterproCode[] {
        return p.interproEntries;
    }

    protected getNamespaces(): FunctionalNamespace[] {
        return Object.values(InterproNamespace);
    }

    protected async getOntology(countTable: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>> {
        const processor = new InterproOntologyProcessor();
        return await processor.getOntology(countTable);
    }

}
