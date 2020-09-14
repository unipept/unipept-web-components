import { InterproNamespace } from "./InterproNamespace";
import Definition from "./../../Definition";
export declare type InterproCode = string;
export default class InterproDefinition implements Definition {
    readonly code: string;
    readonly name: string;
    readonly namespace: InterproNamespace;
    constructor(code: string, name: string, namespace: InterproNamespace);
}
