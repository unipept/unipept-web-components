import GoDefinition, { GoCode } from "./GoDefinition";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import { GoResponse } from "./../../../communication/functional/go/GoResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
export default class GoOntologyProcessor extends FunctionalOntologyProcessor<GoCode, GoDefinition, GoResponse> {
    private readonly comSource;
    constructor(comSource: CommunicationSource);
    protected getCommunicator(): FunctionalResponseCommunicator<GoCode, GoResponse>;
    protected responseToDefinition(response: GoResponse): GoDefinition;
}
