import FunctionalResponse from "@/business/communication/functional/FunctionalResponse";
import { InterproCode } from "@/business/ontology/functional/interpro/InterproDefinition";

export default interface InterproResponse extends FunctionalResponse<InterproCode> {}
