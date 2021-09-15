import { CountTable, Peptide, PeptideData, PeptideTrust } from "@/business";
import { ShareableMap } from "shared-memory-datastructures";

export default class PeptideTrustProcessor {
    public getPeptideTrust(
        countTable: CountTable<Peptide>,
        pept2data: ShareableMap<Peptide, PeptideData>
    ): PeptideTrust {
        let matchedPeptides: number = 0;
        let missedPeptides: Peptide[] = [];

        for (const peptide of countTable.getOntologyIds()) {
            if (!pept2data.has(peptide)) {
                missedPeptides.push(peptide);
            } else {
                matchedPeptides += countTable.getCounts(peptide);
            }
        }

        return new PeptideTrust(missedPeptides, matchedPeptides, countTable.totalCount);
    }
}
