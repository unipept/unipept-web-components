import Definition from "../../Definition";
import GoNamespace from "./GoNamespace";
export default class GoDefinition implements Definition {
    readonly code: string;
    readonly name: string;
    readonly namespace: GoNamespace;
    constructor(code: string, name: string, namespace: GoNamespace);
}
