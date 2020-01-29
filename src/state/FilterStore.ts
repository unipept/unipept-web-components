import Assay from "../logic/data-management/assay/Assay";
import { ActionContext, ActionTree, GetterTree, MutationTree } from "vuex";
import MpaAnalysisManager from "../logic/data-management/MpaAnalysisManager";
import MPAConfig from "../logic/data-management/MPAConfig";

export interface FilterState {
    searchSettings: MPAConfig,
    selectedTerm: string,
    selectedTaxonId: number,
}

const mpaState: FilterState = {
    searchSettings: { il: true, dupes: true, missed: false },
    selectedTerm: "Organism",
    selectedTaxonId: -1,
};

const mpaGetters: GetterTree<FilterState, any> = {
    searchSettings(state: FilterState): MPAConfig {
        return state.searchSettings;
    },
    selectedTerm(state: FilterState): string {
        return state.selectedTerm;
    },
    selectedTaxonId(state: FilterState): number {
        return state.selectedTaxonId;
    },
};

const mpaMutations: MutationTree<FilterState> = {
    SET_SEARCH_SETTINGS(state: FilterState, searchSettings: MPAConfig): void {
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
    setSearchSettings(store: ActionContext<FilterState, any>, searchSettings: MPAConfig): void {
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
