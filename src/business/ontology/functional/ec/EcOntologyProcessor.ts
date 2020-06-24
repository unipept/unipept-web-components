import EcDefinition, { EcCode } from "./EcDefinition";
import { convertEcNumberToEcNamespace } from "./EcNamespace";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import { EcResponse } from "./../../../communication/functional/ec/EcResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
import CommunicationSource from "./../../../communication/source/CommunicationSource";

export default class EcOntologyProcessor extends FunctionalOntologyProcessor<EcCode, EcDefinition, EcResponse> {
    constructor(private readonly comSource: CommunicationSource) {
        super();
    }

    protected getCommunicator(): FunctionalResponseCommunicator<EcCode, EcResponse> {
        return this.comSource.getEcCommunicator();
    }

    protected responseToDefinition(response: EcResponse): EcDefinition {
        return new EcDefinition(response.code, response.name, convertEcNumberToEcNamespace(response.code));
    }
}
