import { GoNamespace } from "@/logic";
import TableItem from "../TableItem";
export default interface GoTableItem extends TableItem {
    namespace: GoNamespace;
}
