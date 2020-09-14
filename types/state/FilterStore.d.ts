import { ActionTree, GetterTree, MutationTree } from "vuex";
import SearchConfiguration from "./../business/configuration/SearchConfiguration";
export interface FilterState {
    searchSettings: SearchConfiguration;
    selectedTerm: string;
    selectedTaxonId: number;
}
export declare const FilterStore: {
    state: FilterState;
    mutations: MutationTree<FilterState>;
    getters: GetterTree<FilterState, any>;
    actions: ActionTree<FilterState, any>;
};
