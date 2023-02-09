import EcResponse from "../../../../logic/communication/functional/ec/EcResponse";
import EcResponseCommunicator from "../../../../logic/communication/functional/ec/EcResponseCommunicator";
import FunctionalResponseCommunicator from "../../../../logic/communication/functional/FunctionalResponseCommunicator";
import EcCode from "../../../../logic/ontology/functional/ec/EcCode";
import EcDefinition from "../../../../logic/ontology/functional/ec/EcDefinition";
import FunctionalOntologyProcessor from "../FunctionalOntologyProcessor";
export default class EcOntologyProcessor extends FunctionalOntologyProcessor<EcCode, EcDefinition, EcResponse> {
    private readonly ecResponseCommunicator;
    constructor(ecResponseCommunicator: EcResponseCommunicator);
    protected getCommunicator(): FunctionalResponseCommunicator<EcCode, EcResponse>;
    protected responseToDefinition(response: EcResponse): EcDefinition;
}
