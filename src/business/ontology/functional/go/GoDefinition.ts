import { GoNamespace } from "./GoNamespace";
import Definition from "./../../Definition";

export type GoCode = string;

export default class GoDefinition implements Definition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: GoNamespace
    ) {}
}
