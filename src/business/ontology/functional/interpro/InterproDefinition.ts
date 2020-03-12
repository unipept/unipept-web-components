import { InterproNamespace } from "./InterproNamespace";
import Definition from "@/business/ontology/Definition";

export type InterproCode = string;

export default class InterproDefinition implements Definition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: InterproNamespace
    ) {}
}
