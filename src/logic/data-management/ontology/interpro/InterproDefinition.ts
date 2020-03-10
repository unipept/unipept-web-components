import { InterproNameSpace } from "./../../../functional-annotations/InterproNameSpace";

export default class InterproDefinition {
    public readonly code: string;
    public readonly name: string;
    public readonly namespace: InterproNameSpace;

    constructor(code: string, name: string, namespace: InterproNameSpace) {
        this.code = code;
        this.name = name;
        this.namespace = namespace;
    }
}
