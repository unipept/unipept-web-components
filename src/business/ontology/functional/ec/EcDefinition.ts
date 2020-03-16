import { EcNamespace } from "./EcNamespace";
import Definition from "./../../Definition";

export type EcCode = string;

export default class EcDefinition implements Definition {
    /**
     * How specific is this EC-number? 0 is generic, 4 is most specific.
     */
    public readonly level: number;

    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: EcNamespace
    ) {
        this.level = EcDefinition.computeLevel(code);
    }

    /**
     * Computes the list of ancestors of a given EC number. E.g. "2.1.3.-" would give ["2.1.-.-", "2.-.-.-"]
     *
     * @param code The EC-code for which all ancestors need to be computed.
     * @param includeRoot Whether to include the root (-.-.-.-).
     * @return Ancestors of the EC number (from specific to generic).
     */
    public static computeAncestors(code: EcCode, includeRoot: boolean): string[] {
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

    private static computeLevel(code: EcCode): number {
        return (code + ".-").split(".").indexOf("-");
    }
}
