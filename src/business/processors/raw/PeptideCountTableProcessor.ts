import { Peptide } from "@/business/ontology/raw/Peptide";
import { CountTable } from "@/business/counts/CountTable";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";

export default class PeptideCountTableProcessor {
    /**
     * Convert a list of peptides into a count table. This function directly filters the given list of peptides, based
     * on the search configuration given here.
     *
     * @param peptides The (unfiltered) list of peptides for which a count table should be built.
     * @param searchConfiguration A configuration that indicates what extra processing steps should be applied to the
     * list of peptides, before converting them to a count table.
     */
    public async getPeptideCountTable(
        peptides: Peptide[],
        searchConfiguration: SearchConfiguration
    ): Promise<CountTable<Peptide>> {
        peptides = this.filter(peptides, searchConfiguration);
        const peptideCounts = new Map<Peptide, number>();
        for (const peptide of peptides) {
            const count = peptideCounts.get(peptide) || 0;
            if (searchConfiguration.filterDuplicates) {
                peptideCounts.set(peptide, 1);
            } else {
                peptideCounts.set(peptide, count + 1);
            }
        }
        return new CountTable<Peptide>(peptideCounts);
    }

    private filter(peptides: Peptide[], searchConfiguration: SearchConfiguration): Peptide[] {
        let out = this.cleavePeptides(peptides, searchConfiguration.enableMissingCleavageHandling);
        out = this.filterShortPeptides(out);
        return this.equateIL(out, searchConfiguration.equateIl);
    }

    /**
     * Split all peptides after every K or R if not followed by P if advancedMissedCleavageHandling isn't set.
     */
    private cleavePeptides(peptides: Peptide[], advancedMissedCleavageHandling: boolean): Peptide[] {
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
    private filterShortPeptides(peptides: Peptide[]): Peptide[] {
        return peptides.filter(p => p.length >= 5);
    }

    /**
     * Replaces every I with an L if equateIL is set to true.
     */
    private equateIL(peptides: Peptide[], equateIL: boolean): Peptide[] {
        if (equateIL) {
            return peptides.map(p => p.replace(/I/g, "L"));
        }
        return peptides;
    }
}
