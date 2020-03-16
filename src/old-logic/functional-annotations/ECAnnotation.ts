import FAElement from "./FAElement";
import { EcNameSpace } from "./EcNameSpace";
import ECDefinition from "./../data-management/ontology/ec/ECDefinition";

export default class ECAnnotation extends FAElement {
    public readonly definition: ECDefinition;

    /**
     * Construct a new ECAnnotation.
     *
     * @param definition The EC-number to which this concrete annotation is associated.
     * @param popularity The amount of peptides that's associated with this EC-number in the associated sample.
     * @param fractionOfPepts The fraction of the total amount of peptides that's associated with this EC-number.
     * @param affectedPeptides The peptides that are associated with this functional annotation for a specific assay.
     */
    constructor(definition: ECDefinition, popularity: number, fractionOfPepts: number, affectedPeptides: string[]) {
        super(definition.code, definition.name, popularity, fractionOfPepts, affectedPeptides);
        this.definition = definition;
    }

    public get ancestors(): string[] {
        return ECAnnotation.computeAncestors(this.code);
    }

    /**
     * Calculates how specific the EC-number is as int form 0 (generic) to 4 (specific). Counts the number of non "-" in
     * this EC-number.
     *
     * @return {number}  Level of this EC-number.
     */
    public get level(): number {
        return ECAnnotation.computeLevel(this.code);
    }

    /**
     * Gets a list of ancestors of a given EC number. E.g. "2.1.3.-" would give ["2.1.-.-", "2.-.-.-"]
     *
     * @param code The EC-code for which all ancestors need to be computed.
     * @param includeRoot Whether to include the root (-.-.-.-).
     * @return Ancestors of the EC number (from specific to generic).
     */
    public static computeAncestors(code: string, includeRoot: boolean = false): string[] {
        const result = [];
        const parts = code.split(".");
        const numSpecific = parts.includes("-") ? parts.indexOf("-") : parts.length;

        for (let i = numSpecific - 1; i >= 1; i--) {
            parts[i] = "-";
            result.push(parts.join("."));
        }

        if (includeRoot) {
            result.push("-.-.-.-");
        }

        return result;
    }

    public static computeLevel(code: string): number {
        return (code + ".-").split(".").indexOf("-");
    }
}
