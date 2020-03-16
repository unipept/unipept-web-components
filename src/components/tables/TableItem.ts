import FunctionalDefinition from "./../../business/ontology/functional/FunctionalDefinition";
import { Peptide } from "./../../business/ontology/raw/Peptide";

export default class TableItem {
    constructor(
        public readonly count: number,
        public readonly name: string,
        public readonly code: string,
        public readonly definition: FunctionalDefinition
    ) {}
}
