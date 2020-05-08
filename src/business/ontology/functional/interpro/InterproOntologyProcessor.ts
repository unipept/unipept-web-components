import InterproDefinition, { InterproCode } from "./../../functional/interpro/InterproDefinition";
import InterproResponseCommunicator from "./../../../communication/functional/interpro/InterproResponseCommunicator";
import { convertStringToInterproNamespace } from "./InterproNamespace";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import InterproResponse from "./../../../communication/functional/interpro/InterproResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
import CommunicationSource from "./../../../communication/source/CommunicationSource";

export default class InterproOntologyProcessor extends FunctionalOntologyProcessor<InterproCode, InterproDefinition, InterproResponse> {
    constructor(private readonly comSource: CommunicationSource) {
        super();
    }

    protected getCommunicator(): FunctionalResponseCommunicator<InterproCode, InterproResponse> {
        return this.comSource.getInterproCommunicator();
    }

    protected responseToDefinition(response: InterproResponse): InterproDefinition {
        return new InterproDefinition(
            response.code,
            response.name,
            convertStringToInterproNamespace(response.category.replace("_", " "))
        );
    }
}
