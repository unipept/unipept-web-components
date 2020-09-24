import { OntologyIdType } from "@/business/ontology/Ontology";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import { CountTable, FunctionalDefinition, Ontology } from "@/business";
import { DataOptions } from "vuetify";
import AmountTableItem from "@/components/tables/AmountTableItem";
export default class SingleAmountTableItemRetriever<C extends OntologyIdType, F extends FunctionalDefinition> implements AmountTableItemRetriever<C, F> {
    private readonly functionalCountTable;
    private readonly ontology;
    private readonly totalItemCount;
    constructor(functionalCountTable: CountTable<C>, ontology: Ontology<C, F>, totalItemCount: number);
    getItemCount(): number;
    getItems(tableOptions: DataOptions): AmountTableItem[];
}
