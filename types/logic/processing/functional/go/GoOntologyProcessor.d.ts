import { FunctionalResponseCommunicator, GoResponse, GoResponseCommunicator } from "@/logic/communication";
import { GoCode, GoDefinition } from "@/logic/ontology";
import FunctionalOntologyProcessor from "../FunctionalOntologyProcessor";
export default class GoOntologyProcessor extends FunctionalOntologyProcessor<GoCode, GoDefinition, GoResponse> {
    private readonly goCommunicator;
    constructor(goCommunicator: GoResponseCommunicator);
    protected getCommunicator(): FunctionalResponseCommunicator<GoCode, GoResponse>;
    protected responseToDefinition(response: GoResponse): GoDefinition;
}
