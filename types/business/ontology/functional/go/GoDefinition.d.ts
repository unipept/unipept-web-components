import { GoNamespace } from "./GoNamespace";
import Definition from "./../../Definition";
export declare type GoCode = string;
export default class GoDefinition implements Definition {
    readonly code: string;
    readonly name: string;
    readonly namespace: GoNamespace;
    constructor(code: string, name: string, namespace: GoNamespace);
}
