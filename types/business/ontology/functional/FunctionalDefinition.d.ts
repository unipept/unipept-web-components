import Definition from "./../Definition";
import { FunctionalNamespace } from "./FunctionalNamespace";
import { GoCode } from "@/business/ontology/functional/go/GoDefinition";
import { EcCode } from "@/business/ontology/functional/ec/EcDefinition";
import { InterproCode } from "@/business/ontology/functional/interpro/InterproDefinition";
export declare type FunctionalCode = GoCode | EcCode | InterproCode;
export default class FunctionalDefinition implements Definition {
    readonly code: string;
    readonly name: string;
    readonly namespace: FunctionalNamespace;
    constructor(code: string, name: string, namespace: FunctionalNamespace);
}
