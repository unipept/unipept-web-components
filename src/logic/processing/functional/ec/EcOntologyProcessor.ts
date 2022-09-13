import { EcResponse, EcResponseCommunicator, FunctionalResponseCommunicator } from "@/logic/communication";
import { EcCode, EcDefinition } from "@/logic/ontology";
import { convertEcNumberToEcNamespace } from "@/logic/ontology/functional/ec/EcNamespace";
import FunctionalOntologyProcessor from "../FunctionalOntologyProcessor";

export default class EcOntologyProcessor extends FunctionalOntologyProcessor<EcCode, EcDefinition, EcResponse> {
    constructor(private readonly ecResponseCommunicator: EcResponseCommunicator) {
        super();
    }

    protected getCommunicator(): FunctionalResponseCommunicator<EcCode, EcResponse> {
        return this.ecResponseCommunicator;
    }

    protected responseToDefinition(response: EcResponse): EcDefinition {
        return new EcDefinition(response.code, response.name, convertEcNumberToEcNamespace(response.code));
    }
}
