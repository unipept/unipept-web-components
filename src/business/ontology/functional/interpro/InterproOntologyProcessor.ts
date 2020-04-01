import OntologyProcessor from "./../../OntologyProcessor";
import InterproDefinition, { InterproCode } from "./../../functional/interpro/InterproDefinition";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";
import InterproResponseCommunicator from "./../../../communication/functional/interpro/InterproResponseCommunicator";
import { convertStringToInterproNamespace } from "./InterproNamespace";

export default class InterproOntologyProcessor implements OntologyProcessor<InterproCode, InterproDefinition> {
    public async getOntology(table: CountTable<InterproCode>): Promise<Ontology<InterproCode, InterproDefinition>> {
        return await this.getOntologyByIds(table.getOntologyIds());
    }

    public async getOntologyByIds(codes: InterproCode[]): Promise<Ontology<InterproCode, InterproDefinition>> {
        await InterproResponseCommunicator.process(codes);

        const definitions = new Map<InterproCode, InterproDefinition>();

        for (const code of codes) {
            const apiResponse = InterproResponseCommunicator.getResponse(code);

            if (apiResponse) {
                definitions.set(code, new InterproDefinition(
                    apiResponse.code,
                    apiResponse.name,
                    convertStringToInterproNamespace(apiResponse.category.replace("_", " "))
                ));
            }
        }

        return new Ontology<InterproCode, InterproDefinition>(definitions);
    }

    public async getDefinition(id: InterproCode): Promise<InterproDefinition> {
        await InterproResponseCommunicator.process([id]);
        const response = InterproResponseCommunicator.getResponse(id);

        if (response) {
            return new InterproDefinition(id, response.name, response.category);
        } else {
            return undefined;
        }
    }
}
