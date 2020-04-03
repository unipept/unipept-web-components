import InterproDefinition, { InterproCode } from "./../../functional/interpro/InterproDefinition";
import InterproResponseCommunicator from "./../../../communication/functional/interpro/InterproResponseCommunicator";
import { convertStringToInterproNamespace } from "./InterproNamespace";
import FunctionalOntologyProcessor from "@/business/ontology/functional/FunctionalOntologyProcessor";
import InterproResponse from "@/business/communication/functional/interpro/InterproResponse";
import FunctionalResponseCommunicator from "@/business/communication/functional/FunctionalResponseCommunicator";

export default class InterproOntologyProcessor extends FunctionalOntologyProcessor<InterproCode, InterproDefinition, InterproResponse> {
    protected getCommunicator(): FunctionalResponseCommunicator<InterproCode, InterproResponse> {
        return new InterproResponseCommunicator();
    }

    protected responseToDefinition(response: InterproResponse): InterproDefinition {
        return new InterproDefinition(
            response.code,
            response.name,
            convertStringToInterproNamespace(response.category.replace("_", " "))
        );
    }
}
