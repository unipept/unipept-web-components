import { Peptide } from "./../../ontology/raw/Peptide";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import { expose } from "threads/worker";

expose(process);

function process(peptides: Peptide[], searchConfiguration: SearchConfiguration): Map<Peptide, number> {
    peptides = filter(peptides, searchConfiguration);
    const peptideCounts = new Map<Peptide, number>();
    for (const peptide of peptides) {
        const count = peptideCounts.get(peptide) || 0;
        if (searchConfiguration.filterDuplicates) {
            peptideCounts.set(peptide, 1);
        } else {
            peptideCounts.set(peptide, count + 1);
        }
    }
    return peptideCounts;
}

function filter(peptides: Peptide[], searchConfiguration: SearchConfiguration): Peptide[] {
    let out = cleavePeptides(peptides, searchConfiguration.enableMissingCleavageHandling);
    out = filterShortPeptides(out);
    return equateIL(out, searchConfiguration.equateIl);
}

/**
 * Split all peptides after every K or R if not followed by P if advancedMissedCleavageHandling isn't set.
 */
function cleavePeptides(peptides: Peptide[], advancedMissedCleavageHandling: boolean): Peptide[] {
    if (!advancedMissedCleavageHandling) {
        return peptides.join("+")
            .replace(/([KR])([^P])/g, "$1+$2")
            .replace(/([KR])([^P+])/g, "$1+$2")
            .split("+");
    }
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
