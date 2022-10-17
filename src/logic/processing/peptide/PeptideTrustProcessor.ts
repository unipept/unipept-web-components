import PeptideData from "../../../logic/communication/peptide/PeptideData";
import Peptide from "../../../logic/ontology/peptide/Peptide";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../CountTable";
import PeptideTrust from "./PeptideTrust";

export default class PeptideTrustProcessor {
    public getPeptideTrust(
        countTable: CountTable<Peptide>,
        pept2data: ShareableMap<Peptide, PeptideData>
    ): PeptideTrust {
        console.log('peptdata', pept2data);
        let matchedPeptides = 0;
        const missedPeptides: Peptide[] = [];

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
