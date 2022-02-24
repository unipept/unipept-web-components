import EcDefinition, { EcCode } from "./EcDefinition";
import { convertEcNumberToEcNamespace } from "./EcNamespace";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import { EcResponse } from "./../../../communication/functional/ec/EcResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
import { EcResponseCommunicator } from "@/business";

export default class EcOntologyProcessor extends FunctionalOntologyProcessor<EcCode, EcDefinition, EcResponse> {
    constructor(private readonly ecResponseCommunicator: EcResponseCommunicator) {
        super();
    }

    protected getCommunicator(): FunctionalResponseCommunicator<EcCode, EcResponse> {
        return this.ecResponseCommunicator;
    }

    protected responseToDefinition(response: EcResponse): EcDefinition {
        return new EcDefinition(response.code, response.name, convertEcNumberToEcNamespace(response.code));
    }
}
