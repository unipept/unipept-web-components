import { ItemRetriever } from "./../../components/tables/ItemRetriever";
import { CountTable } from "./../../business/counts/CountTable";
import { Peptide } from "./../../business/ontology/raw/Peptide";
import { Ontology, OntologyIdType } from "./../../business/ontology/Ontology";
import TableItem from "./TableItem";
import FunctionalDefinition from "./../../business/ontology/functional/FunctionalDefinition";
export default class FunctionalItemRetriever<C extends OntologyIdType, F extends FunctionalDefinition> implements ItemRetriever {
    private readonly functionalCountTable;
    private readonly peptideCountTable;
    private readonly ontology;
    constructor(functionalCountTable: CountTable<C>, peptideCountTable: CountTable<Peptide>, ontology: Ontology<C, F>);
    getItemCount(): number;
    getItems(tableOptions: any): TableItem[];
}
