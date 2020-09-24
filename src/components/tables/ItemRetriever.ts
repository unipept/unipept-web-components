import { DataOptions } from "vuetify";

export interface ItemRetriever<TableItemType> {
    getItemCount(): number;
    getItems(tableOptions: DataOptions): TableItemType[];
}
