import { ActionContext, ActionTree, GetterTree, MutationTree } from "vuex";
import SearchConfiguration from "./../business/configuration/SearchConfiguration";

export interface FilterState {
    searchSettings: SearchConfiguration,
    selectedTerm: string,
    selectedTaxonId: number,
}

const mpaState: FilterState = {
    searchSettings: { equateIl: true, filterDuplicates: true, enableMissingCleavageHandling: false },
    selectedTerm: "Organism",
    selectedTaxonId: -1,
};

const mpaGetters: GetterTree<FilterState, any> = {
    searchSettings(state: FilterState): SearchConfiguration {
        return state.searchSettings;
    },
    getSelectedTerm(state: FilterState): string {
        return state.selectedTerm;
    },
    getSelectedTaxonId(state: FilterState): number {
        return state.selectedTaxonId;
    },
};

const mpaMutations: MutationTree<FilterState> = {
    SET_SEARCH_SETTINGS(state: FilterState, searchSettings: SearchConfiguration): void {
        state.searchSettings = searchSettings;
    },
    SET_SELECTED_TERM(state: FilterState, value: string): void {
        state.selectedTerm = value;
    },
    SET_SELECTED_TAXON_ID(state: FilterState, value: number): void {
        state.selectedTaxonId = value;
    }
};

const mpaActions: ActionTree<FilterState, any> = {
    setSearchSettings(store: ActionContext<FilterState, any>, searchSettings: SearchConfiguration): void {
        store.commit("SET_SEARCH_SETTINGS", searchSettings);
    },
    setSelectedTerm(store: ActionContext<FilterState, any>, term: string): void {
        store.commit("SET_SELECTED_TERM", term);
    },
    setSelectedTaxonId(store: ActionContext<FilterState, any>, taxonId: number): void {
        store.commit("SET_SELECTED_TAXON_ID", taxonId);
    }
};

export const FilterStore = {
    state: mpaState,
    mutations: mpaMutations,
    getters: mpaGetters,
    actions: mpaActions
};
