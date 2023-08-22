import { InterproNamespace } from "@/logic";
import TableItem from "@/components/tables/TableItem";
export default interface InterproTableItem extends TableItem {
    namespace: InterproNamespace;
}
