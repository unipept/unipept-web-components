import OntologyProcessor from "@/business/ontology/OntologyProcessor";
import EcDefinition, { EcCode } from "@/business/ontology/functional/ec/EcDefinition";
import { CountTable } from "@/business/counts/CountTable";
import { Ontology } from "@/business/ontology/Ontology";
import EcResponseCommunicator from "@/business/communication/functional/ec/EcResponseCommunicator";
import { convertEcNumberToEcNamespace } from "@/business/ontology/functional/ec/EcNamespace";

export default class EcOntologyProcessor implements OntologyProcessor<EcCode, EcDefinition> {
    private static codeDefinitionMap = new Map<EcCode, EcDefinition>();

    public async getOntology(table: CountTable<EcCode>): Promise<Ontology<string, EcDefinition>> {
        const codes = new Set<EcCode>(table.getOntologyIds());
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

}
