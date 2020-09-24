import { CountTable } from "@/business/counts/CountTable";
import { Peptide } from "@/business/ontology/raw/Peptide";
import { Ontology, OntologyIdType } from "@/business/ontology/Ontology";
import AmountTableItem from "./../../tables/AmountTableItem";
import FunctionalDefinition from "@/business/ontology/functional/FunctionalDefinition";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
export default class MultiAmountTableItemRetriever<C extends OntologyIdType, F extends FunctionalDefinition> implements AmountTableItemRetriever<C, F> {
    private readonly functionalCountTable;
    private readonly peptideCountTable;
    private readonly ontology;
    constructor(functionalCountTable: CountTable<C>, peptideCountTable: CountTable<Peptide>, ontology: Ontology<C, F>);
    getItemCount(): number;
    getItems(tableOptions: any): AmountTableItem[];
}
