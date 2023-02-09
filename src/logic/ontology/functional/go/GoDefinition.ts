import Definition from "../../Definition";
import GoNamespace from "./GoNamespace";

export default class GoDefinition implements Definition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: GoNamespace
    ) {}
}
