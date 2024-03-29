import FunctionalResponseCommunicator from "../../../../logic/communication/functional/FunctionalResponseCommunicator";
import InterproResponse from "../../../../logic/communication/functional/interpro/InterproResponse";
import InterproResponseCommunicator from "../../../../logic/communication/functional/interpro/InterproResponseCommunicator";
import InterproCode from "../../../../logic/ontology/functional/interpro/InterproCode";
import InterproDefinition from "../../../../logic/ontology/functional/interpro/InterproDefinition";
import { convertStringToInterproNamespace } from "../../../../logic/ontology/functional/interpro/InterproNamespace";
import FunctionalOntologyProcessor from "../FunctionalOntologyProcessor";

export default class InterproOntologyProcessor extends FunctionalOntologyProcessor<InterproCode, InterproDefinition, InterproResponse> {
    constructor(private readonly interproCommunicationSource: InterproResponseCommunicator) {
        super();
    }

    protected getCommunicator(): FunctionalResponseCommunicator<InterproCode, InterproResponse> {
        return this.interproCommunicationSource;
    }

    protected responseToDefinition(response: InterproResponse): InterproDefinition {
        return new InterproDefinition(
            response.code,
            response.name,
            convertStringToInterproNamespace(response.category.replace("_", " "))
        );
    }
}
