import { GoNameSpace } from "./GoNameSpace";
import FAElement from "./FAElement";
import GODefinition from "./../data-management/ontology/go/GODefinition";

export default class GOAnnotation extends FAElement {
    public definition: GODefinition;

    constructor(definition: GODefinition, popularity: number, fractionOfPepts: number, affectedPeptides: string[]) {
        super(definition.code, definition.name, popularity, fractionOfPepts, affectedPeptides);
        this.definition = definition;
    }
}
