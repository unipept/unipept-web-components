import Definition from "../../Definition";
import InterproNamespace from "./InterproNamespace";
export default class InterproDefinition implements Definition {
    readonly code: string;
    readonly name: string;
    readonly namespace: InterproNamespace;
    constructor(code: string, name: string, namespace: InterproNamespace);
}
