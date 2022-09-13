import { GoCode, GoNamespace } from "@/logic/ontology";
import FunctionalResponse from "../FunctionalResponse";
export default interface GoResponse extends FunctionalResponse<GoCode> {
    namespace: GoNamespace;
}
