import Definition from "../../Definition";
import InterproNamespace from "./InterproNamespace";

export default class InterproDefinition implements Definition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: InterproNamespace
    ) {}
}
