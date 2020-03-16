import Definition from "@/business/ontology/Definition";
import { FunctionalNamespace } from "@/business/ontology/functional/FunctionalNamespace";

export default class FunctionalDefinition implements Definition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: FunctionalNamespace
    ) {}
}
