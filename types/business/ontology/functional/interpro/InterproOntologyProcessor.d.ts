import InterproDefinition, { InterproCode } from "./../../functional/interpro/InterproDefinition";
import InterproResponseCommunicator from "./../../../communication/functional/interpro/InterproResponseCommunicator";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import InterproResponse from "./../../../communication/functional/interpro/InterproResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
export default class InterproOntologyProcessor extends FunctionalOntologyProcessor<InterproCode, InterproDefinition, InterproResponse> {
    private readonly interproCommunicationSource;
    constructor(interproCommunicationSource: InterproResponseCommunicator);
    protected getCommunicator(): FunctionalResponseCommunicator<InterproCode, InterproResponse>;
    protected responseToDefinition(response: InterproResponse): InterproDefinition;
}
