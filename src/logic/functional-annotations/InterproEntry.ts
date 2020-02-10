import FAElement from "./FAElement";
import { InterproNameSpace } from "./InterproNameSpace";

export default class InterproEntry extends FAElement {
    // The GO-namespace associated with this code. Must be a valid namespace!
    public namespace: InterproNameSpace;

    constructor(
        code: string, 
        name: string, 
        namespace: InterproNameSpace, 
        popularity: number, 
        fractionOfPepts: number, 
        affectedPeptides: string[]
    ) {
        super(code, name, popularity, fractionOfPepts, affectedPeptides);
        this.namespace = namespace;
    }
}
