import OntologyProcessor from "@/business/ontology/OntologyProcessor";
import InterproDefinition, { InterproCode } from "@/business/ontology/functional/interpro/InterproDefinition";
import { CountTable } from "@/business/counts/CountTable";
import { Ontology } from "@/business/ontology/Ontology";

export default class InterproOntologyProcessor implements OntologyProcessor<InterproCode, InterproDefinition> {
    public getOntology(table: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>> {
        return Promise.resolve(undefined);
    }
}
