import { ItemRetriever } from "./../../components/tables/ItemRetriever";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import { Ontology, OntologyIdType } from "./../../business/ontology/Ontology";
import TableItem from "./TableItem";
import FunctionalDefinition from "@/business/ontology/functional/FunctionalDefinition";

export default class FunctionalItemRetriever<C extends OntologyIdType, F extends FunctionalDefinition> implements ItemRetriever {
    constructor(
        private readonly functionalCountTable: CountTable<C>,
        private readonly peptideCountTable: CountTable<Peptide>,
        private readonly ontology: Ontology<C, F>
    ) {}

    public getItemCount(): number {
        return this.functionalCountTable.toMap().size;
    }

    public getItems(tableOptions): TableItem[] {
        const items: TableItem[] = [];

        const start = tableOptions.itemsPerPage * (tableOptions.page - 1);
        let end = tableOptions.itemsPerPage * tableOptions.page;

        if (end > this.getItemCount()) {
            end = this.getItemCount();
        }

        // TODO support the sorting based by other columns!

        for (const [code, currentCount] of [...this.functionalCountTable.toMap().entries()].slice(start, end)) {
            const definition: F = this.ontology.getDefinition(code);

            items.push(new TableItem(
                currentCount,
                currentCount / this.peptideCountTable.totalCount,
                definition.name,
                definition.code,
                definition
            ));
        }
        return items;
    }
}
