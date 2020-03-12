import { EcCode } from "@/business/ontology/functional/ec/EcDefinition";
import FunctionalResponse from "@/business/communication/functional/FunctionalResponse";

export interface EcResponse extends FunctionalResponse<EcCode> {}
