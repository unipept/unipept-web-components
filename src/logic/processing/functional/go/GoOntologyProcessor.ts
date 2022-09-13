import { FunctionalResponseCommunicator, GoResponse, GoResponseCommunicator } from "@/logic/communication";
import { GoCode, GoDefinition } from "@/logic/ontology";
import FunctionalOntologyProcessor from "../FunctionalOntologyProcessor";

export default class GoOntologyProcessor extends FunctionalOntologyProcessor<GoCode, GoDefinition, GoResponse> {
    constructor(private readonly goCommunicator: GoResponseCommunicator) {
        super();
    }

    protected getCommunicator(): FunctionalResponseCommunicator<GoCode, GoResponse> {
        return this.goCommunicator;
    }

    protected responseToDefinition(response: GoResponse): GoDefinition {
        return new GoDefinition(response.code, response.name, response.namespace);
    }
}
