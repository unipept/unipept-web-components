import FAElement from "./FAElement";
import { InterproNameSpace } from "./InterproNameSpace";
import InterproDefinition from "./../data-management/ontology/interpro/InterproDefinition";

export default class InterproAnnotation extends FAElement {
    public definition: InterproDefinition;

    constructor(
        definition: InterproDefinition,
        popularity: number,
        fractionOfPepts: number,
        affectedPeptides: string[]
    ) {
        super(definition.code, definition.name, popularity, fractionOfPepts, affectedPeptides);
        this.definition = definition;
    }
}
