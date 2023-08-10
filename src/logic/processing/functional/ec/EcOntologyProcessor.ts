import EcResponse from "../../../../logic/communication/functional/ec/EcResponse";
import EcResponseCommunicator from "../../../../logic/communication/functional/ec/EcResponseCommunicator";
import FunctionalResponseCommunicator from "../../../../logic/communication/functional/FunctionalResponseCommunicator";
import EcCode from "../../../../logic/ontology/functional/ec/EcCode";
import EcDefinition from "../../../../logic/ontology/functional/ec/EcDefinition";
import { convertEcNumberToEcNamespace } from "../../../../logic/ontology/functional/ec/EcNamespace";
import FunctionalOntologyProcessor from "../FunctionalOntologyProcessor";

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
