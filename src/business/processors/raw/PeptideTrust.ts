import { Peptide } from "./../../ontology/raw/Peptide";

export default class PeptideTrust {
    constructor(
        public readonly missedPeptides: Peptide[],
        public readonly matchedPeptides: number,
        public readonly searchedPeptides: number
    ) {}
}
