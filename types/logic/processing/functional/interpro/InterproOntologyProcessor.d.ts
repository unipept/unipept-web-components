import FunctionalResponseCommunicator from "../../../../logic/communication/functional/FunctionalResponseCommunicator";
import InterproResponse from "../../../../logic/communication/functional/interpro/InterproResponse";
import InterproResponseCommunicator from "../../../../logic/communication/functional/interpro/InterproResponseCommunicator";
import InterproCode from "../../../../logic/ontology/functional/interpro/InterproCode";
import InterproDefinition from "../../../../logic/ontology/functional/interpro/InterproDefinition";
import FunctionalOntologyProcessor from "../FunctionalOntologyProcessor";
export default class InterproOntologyProcessor extends FunctionalOntologyProcessor<InterproCode, InterproDefinition, InterproResponse> {
    private readonly interproCommunicationSource;
    constructor(interproCommunicationSource: InterproResponseCommunicator);
    protected getCommunicator(): FunctionalResponseCommunicator<InterproCode, InterproResponse>;
    protected responseToDefinition(response: InterproResponse): InterproDefinition;
}
