import { GoNameSpace } from "./../../../functional-annotations/GoNameSpace";

export default class GODefinition {
    public readonly code: string;
    public readonly name: string;
    public readonly namespace: GoNameSpace;

    constructor(code: string, name: string, namespace: GoNameSpace) {
        this.code = code;
        this.name = name;
        this.namespace = namespace;
    }
}
