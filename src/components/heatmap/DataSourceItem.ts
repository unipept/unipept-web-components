import { Peptide } from "./../../business/ontology/raw/Peptide";

export default class DataSourceItem {
    constructor(
        public readonly name: string,
        public readonly id: number | string,
        public readonly count: number,
        // Used for filtering based upon category later on.
        public readonly category: string,
        // List of peptides associated with this item
        public readonly peptides: Readonly<Peptide[]>
    ){}
}
