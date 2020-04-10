import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import StringUtils from "./../../../business/misc/StringUtils";

export class FunctionalUtils {
    /**
     * Creates a line indicating the trust of the function annotations
     *
     * @param trust The FunctionalTrust-object that contains all necessary trust information.
     * @param kind Human readable word that fits in "To have at least one … assigned to it"
     * @return A string describing the trust information, with correct pluralization.
     */
    public static computeTrustLine(trust: FunctionalTrust, kind: string): string {
        if (trust.annotatedPeptides === 0) {
            return `<strong>No peptide</strong> has a ${kind} assigned to it. `;
        }
        if (trust.annotatedPeptides === trust.totalAmountOfPeptides) {
            return `<strong>All peptides</strong> ${trust.annotatedPeptides <= 5 ? `(only ${trust.annotatedPeptides})` : ""} have at least one ${kind} assigned to them. `;
        }
        if (trust.annotatedPeptides === 1) {
            return `Only <strong>one peptide</strong> (${StringUtils.numberToPercent(trust.annotatedPeptides / trust.totalAmountOfPeptides)}) has at least one ${kind} assigned to it. `;
        }
        return `<strong>${trust.annotatedPeptides}</strong> (${StringUtils.numberToPercent(trust.annotatedPeptides / trust.totalAmountOfPeptides)}) have at least one ${kind} assigned to them. `;
    }
}
