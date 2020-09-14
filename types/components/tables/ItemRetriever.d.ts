import TableItem from "./TableItem";
export interface ItemRetriever {
    getItemCount(): number;
    getItems(tableOptions: any): TableItem[];
}
