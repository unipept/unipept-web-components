import { InterproResponse, InterproResponseCommunicator, FunctionalResponseCommunicator } from "@/logic/communication";
import { InterproCode, InterproDefinition } from "@/logic/ontology";
import FunctionalOntologyProcessor from "../FunctionalOntologyProcessor";
export default class InterproOntologyProcessor extends FunctionalOntologyProcessor<InterproCode, InterproDefinition, InterproResponse> {
    private readonly interproCommunicationSource;
    constructor(interproCommunicationSource: InterproResponseCommunicator);
    protected getCommunicator(): FunctionalResponseCommunicator<InterproCode, InterproResponse>;
    protected responseToDefinition(response: InterproResponse): InterproDefinition;
}
