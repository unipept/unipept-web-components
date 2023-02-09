import FunctionalResponseCommunicator from "../../../../logic/communication/functional/FunctionalResponseCommunicator";
import GoResponse from "../../../../logic/communication/functional/go/GoResponse";
import GoResponseCommunicator from "../../../../logic/communication/functional/go/GoResponseCommunicator";
import GoCode from "../../../../logic/ontology/functional/go/GoCode";
import GoDefinition from "../../../../logic/ontology/functional/go/GoDefinition";
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
