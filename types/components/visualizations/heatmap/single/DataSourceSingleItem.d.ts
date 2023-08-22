import Peptide from "@/logic/ontology/peptide/Peptide";
export default interface DataSourceSingleItem {
    name: string;
    id: number | string;
    count: number;
    category: string;
    peptides: Peptide[];
}
