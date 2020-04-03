import GoDefinition, { GoCode } from "./GoDefinition";
import GoResponseCommunicator from "./../../../communication/functional/go/GoResponseCommunicator";
import FunctionalOntologyProcessor from "@/business/ontology/functional/FunctionalOntologyProcessor";
import { GoResponse } from "@/business/communication/functional/go/GoResponse";
import FunctionalResponseCommunicator from "@/business/communication/functional/FunctionalResponseCommunicator";

export default class GoOntologyProcessor extends FunctionalOntologyProcessor<GoCode, GoDefinition, GoResponse> {
    protected getCommunicator(): FunctionalResponseCommunicator<GoCode, GoResponse> {
        return new GoResponseCommunicator();
    }

    protected responseToDefinition(response: GoResponse): GoDefinition {
        return new GoDefinition(response.code, response.name, response.namespace);
    }
}
