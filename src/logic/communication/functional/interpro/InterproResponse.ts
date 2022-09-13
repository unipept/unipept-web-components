import { InterproCode, InterproNamespace } from "@/logic/ontology";
import FunctionalResponse from "../FunctionalResponse";

export default interface InterproResponse extends FunctionalResponse<InterproCode> {
    category: InterproNamespace
}
