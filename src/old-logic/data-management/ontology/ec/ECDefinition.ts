import { EcNameSpace } from "./../../../functional-annotations/EcNameSpace";

export default class ECDefinition {
    public readonly code: string;
    public readonly name: string;
    public readonly namespace: EcNameSpace;

    constructor(code: string, name: string, namespace: EcNameSpace) {
        this.code = code;
        this.name = name;
        this.namespace = namespace;
    }
}
