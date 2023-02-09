import Definition from "../Definition";
import FunctionalNamespace from "./FunctionalNamespace";

export default class FunctionalDefinition implements Definition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: FunctionalNamespace
    ) {}
}
