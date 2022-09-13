import { InterproResponse, InterproResponseCommunicator, FunctionalResponseCommunicator } from "@/logic/communication";
import { InterproCode, InterproDefinition } from "@/logic/ontology";
import { convertStringToInterproNamespace } from "@/logic/ontology/functional/interpro/InterproNamespace";
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
