import { EcNamespace } from "./EcNamespace";
import Definition from "./../../Definition";

export type EcCode = string;

export default class EcDefinition implements Definition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: EcNamespace
    ) {}
}
