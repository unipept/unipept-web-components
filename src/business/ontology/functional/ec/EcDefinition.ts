import { EcNamespace } from "@/business/ontology/functional/ec/EcNamespace";
import Definition from "@/business/ontology/Definition";

export type EcCode = string;

export default class EcDefinition implements Definition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: EcNamespace
    ) {}
}
