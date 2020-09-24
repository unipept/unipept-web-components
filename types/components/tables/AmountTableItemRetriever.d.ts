import { ItemRetriever } from "@/components/tables/ItemRetriever";
import { OntologyIdType } from "@/business/ontology/Ontology";
import AmountTableItem from "./AmountTableItem";
import FunctionalDefinition from "@/business/ontology/functional/FunctionalDefinition";
export default interface AmountTableItemRetriever<C extends OntologyIdType, F extends FunctionalDefinition> extends ItemRetriever<AmountTableItem> {
}
