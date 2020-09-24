import { OntologyIdType } from "@/business/ontology/Ontology";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import { CountTable, FunctionalDefinition, Ontology } from "@/business";
import { UniprotAccessionId } from "@/business/ontology/protein/ProteinDefinition";
import { DataOptions } from "vuetify";
import AmountTableItem from "@/components/tables/AmountTableItem";

export default class SingleAmountTableItemRetriever<
    C extends OntologyIdType,
    F extends FunctionalDefinition
> implements AmountTableItemRetriever<C, F> {
    constructor(
        private readonly functionalCountTable: CountTable<C>,
        private readonly ontology: Ontology<C, F>,
        private readonly totalItemCount: number
    ) {}

    public getItemCount(): number {
        return this.functionalCountTable.toMap().size;
    }

    public getItems(tableOptions: DataOptions): AmountTableItem[] {
        let items: AmountTableItem[] = [];

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

                items.push(new AmountTableItem(
                    this.functionalCountTable.getCounts(code),
                    this.functionalCountTable.getCounts(code) / this.totalItemCount,
                    definition.name,
                    definition.code
                ));
            }
        } else {
            // do nothing at this point in time...
        }

        return items;
    }
}
