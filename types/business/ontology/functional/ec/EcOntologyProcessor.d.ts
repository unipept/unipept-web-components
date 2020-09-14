import EcDefinition, { EcCode } from "./EcDefinition";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import { EcResponse } from "./../../../communication/functional/ec/EcResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
export default class EcOntologyProcessor extends FunctionalOntologyProcessor<EcCode, EcDefinition, EcResponse> {
    private readonly comSource;
    constructor(comSource: CommunicationSource);
    protected getCommunicator(): FunctionalResponseCommunicator<EcCode, EcResponse>;
    protected responseToDefinition(response: EcResponse): EcDefinition;
}
