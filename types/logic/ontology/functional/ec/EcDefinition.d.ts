import Definition from "../../Definition";
import EcCode from "./EcCode";
import EcNamespace from "./EcNamespace";
export default class EcDefinition implements Definition {
    readonly code: string;
    readonly name: string;
    readonly namespace: EcNamespace;
    /**
     * How specific is this EC-number? 0 is generic, 4 is most specific.
     */
    readonly level: number;
    constructor(code: string, name: string, namespace: EcNamespace);
    /**
     * Computes the list of ancestors of a given EC number. E.g. "2.1.3.-" would give ["2.1.-.-", "2.-.-.-"]
     *
     * @param code The EC-code for which all ancestors need to be computed.
     * @param includeRoot Whether to include the root (-.-.-.-).
     * @return Ancestors of the EC number (from specific to generic).
     */
    static computeAncestors(code: EcCode, includeRoot: boolean): string[];
    private static computeLevel;
}
