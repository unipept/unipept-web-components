import Peptide from "../../../logic/ontology/peptide/Peptide";

export default class PeptideTrust {
    constructor(
        public readonly missedPeptides: Peptide[],
        public readonly matchedPeptides: number,
        public readonly searchedPeptides: number
    ) {}
}
