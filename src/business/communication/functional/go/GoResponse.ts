import { GoNamespace } from "./../../../ontology/functional/go/GoNamespace";
import { GoCode } from "./../../../ontology/functional/go/GoDefinition";
import FunctionalResponse from "./../FunctionalResponse";

export interface GoResponse extends FunctionalResponse<GoCode> {
    namespace: GoNamespace
}
