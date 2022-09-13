import { EcResponse, EcResponseCommunicator, FunctionalResponseCommunicator } from "@/logic/communication";
import { EcCode, EcDefinition } from "@/logic/ontology";
import FunctionalOntologyProcessor from "../FunctionalOntologyProcessor";
export default class EcOntologyProcessor extends FunctionalOntologyProcessor<EcCode, EcDefinition, EcResponse> {
    private readonly ecResponseCommunicator;
    constructor(ecResponseCommunicator: EcResponseCommunicator);
    protected getCommunicator(): FunctionalResponseCommunicator<EcCode, EcResponse>;
    protected responseToDefinition(response: EcResponse): EcDefinition;
}
