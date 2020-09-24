import Definition from "./../Definition";
import { FunctionalNamespace } from "./FunctionalNamespace";
import { GoCode } from "@/business/ontology/functional/go/GoDefinition";
import { EcCode } from "@/business/ontology/functional/ec/EcDefinition";
import { InterproCode } from "@/business/ontology/functional/interpro/InterproDefinition";

export type FunctionalCode = GoCode | EcCode | InterproCode;

export default class FunctionalDefinition implements Definition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: FunctionalNamespace
    ) {}
}
