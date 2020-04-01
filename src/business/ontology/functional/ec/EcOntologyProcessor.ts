import OntologyProcessor from "./../../OntologyProcessor";
import EcDefinition, { EcCode } from "./EcDefinition";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";
import EcResponseCommunicator from "./../../../communication/functional/ec/EcResponseCommunicator";
import { convertEcNumberToEcNamespace } from "./EcNamespace";

export default class EcOntologyProcessor implements OntologyProcessor<EcCode, EcDefinition> {
    private static codeDefinitionMap = new Map<EcCode, EcDefinition>();

    public async getOntology(table: CountTable<EcCode>): Promise<Ontology<string, EcDefinition>> {
        return await this.getOntologyByIds(table.getOntologyIds());
    }

    public async getOntologyByIds(codes: EcCode[]): Promise<Ontology<string, EcDefinition>> {
        await EcResponseCommunicator.process(codes);
        const definitions = new Map<EcCode, EcDefinition>();

        for (const code of codes) {
            const apiResponse = EcResponseCommunicator.getResponse(code);

            if (apiResponse) {
                definitions.set(code, new EcDefinition(
                    apiResponse.code,
                    apiResponse.name,
                    convertEcNumberToEcNamespace(apiResponse.code)
                ));
            }
        }

        return new Ontology<EcCode, EcDefinition>(definitions);
    }

    public async getDefinition(id: EcCode): Promise<EcDefinition> {
        await EcResponseCommunicator.process([id]);
        const response = EcResponseCommunicator.getResponse(id);
        if (response) {
            return new EcDefinition(id, response.name, convertEcNumberToEcNamespace(id));
        } else {
            return undefined;
        }
    }
}
