import { ItemRetriever } from "./../../components/tables/ItemRetriever";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import GoDefinition, { GoCode } from "./../../business/ontology/functional/go/GoDefinition";
import { Ontology } from "./../../business/ontology/Ontology";
import TableItem from "./TableItem";

export default class GoItemRetriever implements ItemRetriever {
    constructor(
        private readonly goCountTable: CountTable<GoCode>,
        private readonly peptideCountTable: CountTable<Peptide>,
        private readonly goOntology: Ontology<GoCode, GoDefinition>
    ) {}

    public getItemCount(): number {
        return this.goCountTable.toMap().size;
    }

    public getItems(tableOptions): TableItem[] {
        const items: TableItem[] = [];

        const start = tableOptions.itemsPerPage * (tableOptions.page - 1);
        let end = tableOptions.itemsPerPage * tableOptions.page;

        if (end > this.getItemCount()) {
            end = this.getItemCount();
        }

        // TODO support the sorting based by other columns!

        for (const [goCode, currentCount] of [...this.goCountTable.toMap().entries()].slice(start, end)) {
            const definition: GoDefinition = this.goOntology.getDefinition(goCode);

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
