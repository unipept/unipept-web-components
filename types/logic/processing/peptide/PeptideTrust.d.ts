import { Peptide } from "@/logic";
export default class PeptideTrust {
    readonly missedPeptides: Peptide[];
    readonly matchedPeptides: number;
    readonly searchedPeptides: number;
    constructor(missedPeptides: Peptide[], matchedPeptides: number, searchedPeptides: number);
}
