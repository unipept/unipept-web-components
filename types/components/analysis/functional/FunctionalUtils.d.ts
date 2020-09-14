import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
export declare class FunctionalUtils {
    /**
     * Creates a line indicating the trust of the function annotations
     *
     * @param trust The FunctionalTrust-object that contains all necessary trust information.
     * @param faKind Human readable word that fits in "To have at least one … assigned to it". Provide in singular.
     * @param countKind Human readable word that fits in "No ... has a x assigned to it". Provide in singular.
     * @return A string describing the trust information, with correct pluralization.
     */
    static computeTrustLine(trust: FunctionalTrust, faKind: string, countKind: string): string;
}
