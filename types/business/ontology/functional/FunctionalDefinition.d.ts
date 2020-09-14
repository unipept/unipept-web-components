import Definition from "./../Definition";
import { FunctionalNamespace } from "./FunctionalNamespace";
export default class FunctionalDefinition implements Definition {
    readonly code: string;
    readonly name: string;
    readonly namespace: FunctionalNamespace;
    constructor(code: string, name: string, namespace: FunctionalNamespace);
}
