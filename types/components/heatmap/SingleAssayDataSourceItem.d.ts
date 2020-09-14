import { Peptide } from "./../../business/ontology/raw/Peptide";
export default class SingleAssayDataSourceItem {
    readonly name: string;
    readonly id: number | string;
    readonly count: number;
    readonly category: string;
    readonly peptides: Readonly<Peptide[]>;
    constructor(name: string, id: number | string, count: number, category: string, peptides: Readonly<Peptide[]>);
}
