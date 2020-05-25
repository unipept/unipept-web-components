import GoDefinition, { GoCode } from "./GoDefinition";
import GoResponseCommunicator from "./../../../communication/functional/go/GoResponseCommunicator";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import { GoResponse } from "./../../../communication/functional/go/GoResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
import CommunicationSource from "./../../../communication/source/CommunicationSource";

export default class GoOntologyProcessor extends FunctionalOntologyProcessor<GoCode, GoDefinition, GoResponse> {
    constructor(private readonly comSource: CommunicationSource) {
        super();
    }

    protected getCommunicator(): FunctionalResponseCommunicator<GoCode, GoResponse> {
        return this.comSource.getGoCommunicator();
    }

    protected responseToDefinition(response: GoResponse): GoDefinition {
        return new GoDefinition(response.code, response.name, response.namespace);
    }
}
