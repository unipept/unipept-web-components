import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import StringUtils from "./../../../business/misc/StringUtils";

export class FunctionalUtils {
    /**
     * Creates a line indicating the trust of the function annotations
     *
     * @param trust The FunctionalTrust-object that contains all necessary trust information.
     * @param faKind Human readable word that fits in "To have at least one … assigned to it". Provide in singular.
     * @param countKind Human readable word that fits in "No ... has a x assigned to it". Provide in singular.
     * @return A string describing the trust information, with correct pluralization.
     */
    public static computeTrustLine(trust: FunctionalTrust, faKind: string, countKind: string): string {
        if (trust.annotatedItems === 0) {
            return `<strong>No ${countKind}</strong> has a ${faKind} assigned to it. `;
        } else if (trust.annotatedItems === trust.totalAmountOfItems) {
            return `<strong>All ${countKind}s</strong> have at least one ${faKind} assigned to them. `;
        } else if (trust.annotatedItems === 1) {
            return `Only <strong>one ${countKind}</strong> (${StringUtils.numberToPercent(trust.annotatedItems / trust.totalAmountOfItems)}) has at least one ${faKind} assigned to it. `;
        } else {
            return `<strong>${trust.annotatedItems} ${countKind}s</strong> (${StringUtils.numberToPercent(trust.annotatedItems / trust.totalAmountOfItems)}) have at least one ${faKind} assigned to them. `;
        }
    }
}
