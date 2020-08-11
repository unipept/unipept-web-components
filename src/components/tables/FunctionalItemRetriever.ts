import { ItemRetriever } from "./../../components/tables/ItemRetriever";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import { Ontology, OntologyIdType } from "./../../business/ontology/Ontology";
import TableItem from "./TableItem";
import FunctionalDefinition from "./../../business/ontology/functional/FunctionalDefinition";

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
        let items: TableItem[] = [];

        const start = tableOptions.itemsPerPage * (tableOptions.page - 1);
        let end = tableOptions.itemsPerPage * tableOptions.page;

        if (end > this.getItemCount()) {
            end = this.getItemCount();
        }

        let sortKey = "count";

        if (tableOptions.sortBy.length > 0) {
            sortKey = tableOptions.sortBy[0];
        }

        // If we distinguish between the different sort keys, we can extract information without having to sort the
        // complete list of items.
        if (sortKey === "count") {
            const codes = [...this.functionalCountTable.toMap().keys()]

            if (tableOptions.sortDesc.length > 0 && tableOptions.sortDesc[0]) {
                codes.reverse()
            }

            for (const code of codes.slice(start, end)) {
                const definition: F = this.ontology.getDefinition(code);

                if (!definition) {
                    console.log(code);
                }

                items.push(new TableItem(
                    this.functionalCountTable.getCounts(code),
                    this.functionalCountTable.getCounts(code) / this.peptideCountTable.totalCount,
                    definition.name,
                    definition.code,
                    definition
                ));
            }
        } else {
            // General case, create all table items and sort by the specified key.
            const allItems = [];
            for (const [code, currentCount] of this.functionalCountTable.toMap()) {
                const definition: F = this.ontology.getDefinition(code);

                allItems.push(new TableItem(
                    currentCount,
                    currentCount / this.peptideCountTable.totalCount,
                    definition.name,
                    definition.code,
                    definition
                ));
            }

            allItems.sort((a: TableItem, b: TableItem) => {
                let value: number = a[sortKey] > b[sortKey] ? 1 : -1;
                if (tableOptions.sortDesc.length > 0 && tableOptions.sortDesc[0]) {
                    value *= -1;
                }
                return value;
            });

            items = allItems.slice(start, end);
        }

        return items;
    }
}
