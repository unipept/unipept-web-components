import InterproDefinition, { InterproCode } from "./../../functional/interpro/InterproDefinition";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import InterproResponse from "./../../../communication/functional/interpro/InterproResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
export default class InterproOntologyProcessor extends FunctionalOntologyProcessor<InterproCode, InterproDefinition, InterproResponse> {
    private readonly comSource;
    constructor(comSource: CommunicationSource);
    protected getCommunicator(): FunctionalResponseCommunicator<InterproCode, InterproResponse>;
    protected responseToDefinition(response: InterproResponse): InterproDefinition;
}
