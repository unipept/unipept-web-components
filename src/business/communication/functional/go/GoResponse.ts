import { GoNamespace } from "@/business/ontology/functional/go/GoNamespace";
import { GoCode } from "@/business/ontology/functional/go/GoDefinition";
import FunctionalResponse from "@/business/communication/functional/FunctionalResponse";

export interface GoResponse extends FunctionalResponse<GoCode> {
    namespace: GoNamespace
}
