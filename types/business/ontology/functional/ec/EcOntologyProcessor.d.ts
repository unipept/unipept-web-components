import EcDefinition, { EcCode } from "./EcDefinition";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import { EcResponse } from "./../../../communication/functional/ec/EcResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
import { EcResponseCommunicator } from "@/business";
export default class EcOntologyProcessor extends FunctionalOntologyProcessor<EcCode, EcDefinition, EcResponse> {
    private readonly ecResponseCommunicator;
    constructor(ecResponseCommunicator: EcResponseCommunicator);
    protected getCommunicator(): FunctionalResponseCommunicator<EcCode, EcResponse>;
    protected responseToDefinition(response: EcResponse): EcDefinition;
}
