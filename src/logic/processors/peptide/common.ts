import MPAConfig from "../../data-management/MPAConfig";

/**
 * Prepares the list of originalPeptides for use in the application by
 * cleaving, filtering, equating IL and finally generating a frequency table
 */
export function preparePeptides(originalPeptides : string[], config: MPAConfig) {
    let peptides = cleavePeptides(originalPeptides, config.missed);
    peptides = filterShortPeptides(peptides);
    peptides = equateIL(peptides, config.il);
    return indexPeptides(peptides, config.dupes);
}
/**
 * Split all peptides after every K or R if not followed by P if
 * advancedMissedCleavageHandling isn't set
 */
function cleavePeptides(peptides: string[], advancedMissedCleavageHandling: boolean) {
    if (!advancedMissedCleavageHandling) {
        return peptides.join("+")
            .replace(/([KR])([^P])/g, "$1+$2")
            .replace(/([KR])([^P+])/g, "$1+$2")
            .split("+");
    }
    return peptides;
}

/**
 * Filters out all peptides with a length lower than 5
 */
function filterShortPeptides(peptides: string[]) {
    return peptides.filter(p => p.length >= 5);
}

/**
 * Replaces every I with an L if equateIL is set to true
 */
function equateIL(peptides: string[], equateIL: boolean) {
    if (equateIL) {
        return peptides.map(p => p.replace(/I/g, "L"));
    }
    return peptides;
}

/**
 * Creates a frequency table for a list of peptides
 */
function indexPeptides(peptides: string[], dupes: boolean) {
    const peptideMap = new Map<string, number>();
    for (const peptide of peptides) {
        const count = peptideMap.get(peptide) || 0;
        if (dupes) {
            peptideMap.set(peptide, 1);
        } else {
            peptideMap.set(peptide, count + 1);
        }
    }
    return peptideMap;
}