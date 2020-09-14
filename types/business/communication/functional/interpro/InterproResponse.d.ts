import FunctionalResponse from "./../FunctionalResponse";
import { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import { InterproNamespace } from "./../../../ontology/functional/interpro/InterproNamespace";
export default interface InterproResponse extends FunctionalResponse<InterproCode> {
    category: InterproNamespace;
}
