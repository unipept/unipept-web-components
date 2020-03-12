import OntologyProcessor from "./../../OntologyProcessor";
import GoDefinition, { GoCode } from "./GoDefinition";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";
import GoResponseCommunicator from "@/business/communication/functional/go/GoResponseCommunicator";

export default class GoOntologyProcessor implements OntologyProcessor<GoCode, GoDefinition> {
    public async getOntology(table: CountTable<GoCode>): Promise<Ontology<GoCode, GoDefinition>> {
        const codes = new Set<GoCode>(table.getOntologyIds());
        await GoResponseCommunicator.process(codes);

        const definitions = new Map<GoCode, GoDefinition>();

        for (const code of codes) {
            const apiResponse = GoResponseCommunicator.getResponse(code);

            if (apiResponse) {
                definitions.set(code, new GoDefinition(apiResponse.code, apiResponse.name, apiResponse.namespace));
            }
        }

        return new Ontology<GoCode, GoDefinition>(definitions);
    }
}
