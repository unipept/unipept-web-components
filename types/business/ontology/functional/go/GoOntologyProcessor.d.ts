import GoDefinition, { GoCode } from "./GoDefinition";
import GoResponseCommunicator from "./../../../communication/functional/go/GoResponseCommunicator";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import { GoResponse } from "./../../../communication/functional/go/GoResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
export default class GoOntologyProcessor extends FunctionalOntologyProcessor<GoCode, GoDefinition, GoResponse> {
    private readonly goCommunicator;
    constructor(goCommunicator: GoResponseCommunicator);
    protected getCommunicator(): FunctionalResponseCommunicator<GoCode, GoResponse>;
    protected responseToDefinition(response: GoResponse): GoDefinition;
}
