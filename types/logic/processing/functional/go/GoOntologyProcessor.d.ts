import FunctionalResponseCommunicator from "../../../../logic/communication/functional/FunctionalResponseCommunicator";
import GoResponse from "../../../../logic/communication/functional/go/GoResponse";
import GoResponseCommunicator from "../../../../logic/communication/functional/go/GoResponseCommunicator";
import GoCode from "../../../../logic/ontology/functional/go/GoCode";
import GoDefinition from "../../../../logic/ontology/functional/go/GoDefinition";
import FunctionalOntologyProcessor from "../FunctionalOntologyProcessor";
export default class GoOntologyProcessor extends FunctionalOntologyProcessor<GoCode, GoDefinition, GoResponse> {
    private readonly goCommunicator;
    constructor(goCommunicator: GoResponseCommunicator);
    protected getCommunicator(): FunctionalResponseCommunicator<GoCode, GoResponse>;
    protected responseToDefinition(response: GoResponse): GoDefinition;
}
