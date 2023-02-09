import InterproCode from "../../../../logic/ontology/functional/interpro/InterproCode";
import InterproNamespace from "../../../../logic/ontology/functional/interpro/InterproNamespace";
import FunctionalResponse from "../FunctionalResponse";

export default interface InterproResponse extends FunctionalResponse<InterproCode> {
    category: InterproNamespace
}
