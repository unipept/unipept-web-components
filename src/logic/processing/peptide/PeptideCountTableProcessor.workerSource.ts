import Peptide from "../../../logic/ontology/peptide/Peptide";

/**
 * Convert a list of peptides into a count table with respect to a given set of search settings. This count table maps
 * peptides onto the amount of times they occur in the given list.
 *
 * @param peptides A list of peptides for which a count table should be constructed.
 * @param searchConfiguration Indicates to which rules the processing should adhere.
 * @returns A tuple with 2 items. The first item is a mapping between a peptide and it's frequency, and the second item
 * is the total frequency of all items combined (from the first map).
 */
 export default async function compute(
    [
        peptides, 
        enableMissingCleavageHandling, 
        filterDuplicates, 
        equateIl
    ]: [
        Peptide[], 
        boolean, 
        boolean,
        boolean
    ]
): Promise<[Map<Peptide, number>, number]> {
    peptides = filter(peptides, enableMissingCleavageHandling, equateIl);
    const peptideCounts = new Map<Peptide, number>();
    let processed = 0;
    for (const peptide of peptides) {
        processed++;
        const count = peptideCounts.get(peptide) || 0;
        if (filterDuplicates) {
            peptideCounts.set(peptide, 1);
        } else {
            peptideCounts.set(peptide, count + 1);
        }
    }

    let totalFrequency = 0;
    for (const value of peptideCounts.values()) {
        totalFrequency += value;
    }

    return [peptideCounts, totalFrequency];
}

function filter(peptides: Peptide[], enableMissingCleavageHandling: boolean, equateIl: boolean): Peptide[] {
    let out = cleavePeptides(peptides, enableMissingCleavageHandling);
    out = filterShortPeptides(out);
    return equateIL(out, equateIl);
}

/**
 * Split all peptides after every K or R if not followed by P if advancedMissedCleavageHandling isn't set.
 */
function cleavePeptides(peptides: Peptide[], advancedMissedCleavageHandling: boolean): Peptide[] {
    // if (!advancedMissedCleavageHandling) {
    //     return peptides.join("+")
    //         .replace(/([KR])([^P])/g, "$1+$2")
    //         .replace(/([KR])([^P+])/g, "$1+$2")
    //         .split("+");
    // }
    return peptides;
}

/**
 * Filters out all peptides consisting of less than 5 amino acids.
 */
function filterShortPeptides(peptides: Peptide[]): Peptide[] {
    return peptides.filter(p => p.length >= 5);
}

/**
 * Replaces every I with an L if equateIL is set to true.
 */
function equateIL(peptides: Peptide[], equateIL: boolean): Peptide[] {
    if (equateIL) {
        return peptides.map(p => p.replace(/I/g, "L"));
    }
    return peptides;
}
