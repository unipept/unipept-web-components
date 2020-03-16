import OntologyProcessor from "./../../OntologyProcessor";
import InterproDefinition, { InterproCode } from "./../../functional/interpro/InterproDefinition";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";

export default class InterproOntologyProcessor implements OntologyProcessor<InterproCode, InterproDefinition> {
    public async getOntology(table: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>> {
        return undefined;
    }

    public async getDefinition(id: InterproCode): Promise<InterproDefinition> {
        return undefined;
    }
}
