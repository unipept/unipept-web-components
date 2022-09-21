import { FunctionalDefinition, OntologyType } from "@/logic";
import AmountTableItem from "./AmountTableItem";
import { ItemRetriever } from "./ItemRetriever";
export default interface AmountTableItemRetriever<C extends OntologyType, F extends FunctionalDefinition> extends ItemRetriever<AmountTableItem> {
}
