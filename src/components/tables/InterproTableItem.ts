import { InterproNamespace } from "@/logic";
import TableItem from "./TableItem";

export default interface InterproTableItem extends TableItem {
    namespace: InterproNamespace;
};
