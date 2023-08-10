import GoCode from "../../../../logic/ontology/functional/go/GoCode";
import GoNamespace from "../../../../logic/ontology/functional/go/GoNamespace";
import FunctionalResponse from "../FunctionalResponse";

export default interface GoResponse extends FunctionalResponse<GoCode> {
    namespace: GoNamespace
}
