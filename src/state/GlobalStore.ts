import Assay from "../logic/data-management/assay/Assay";
import { ActionContext, ActionTree, GetterTree, MutationTree } from "vuex";
import DatasetManager from "../logic/data-management/DatasetManager";
import MpaAnalysisManager from "../logic/data-management/MpaAnalysisManager";
import MPAConfig from "../logic/data-management/MPAConfig";
import Vue from "vue";

export interface GlobalState {
    analysis: boolean,
    searchSettings: MPAConfig,
    activeDataset: Assay | null,
    selectedTerm: string,
    selectedTaxonId: number,
    // How many datasets are currently being analyzed?
    datasetsInProgress: number,
}

const mpaState: GlobalState = {
    analysis: false,
    searchSettings: { il: true, dupes: true, missed: false },
    activeDataset: null,
    selectedTerm: "Organism",
    selectedTaxonId: -1,
    datasetsInProgress: 0,
};

const mpaGetters: GetterTree<GlobalState, any> = {
    isAnalysis(state: GlobalState): boolean {
        return state.analysis;
    },
    searchSettings(state: GlobalState): MPAConfig {
        return state.searchSettings;
    },
    activeDataset(state: GlobalState): Assay | null {
        return state.activeDataset;
    },
    selectedTerm(state: GlobalState): string {
        return state.selectedTerm;
    },
    selectedTaxonId(state: GlobalState): number {
        return state.selectedTaxonId;
    },
    datasetsInProgress(state: GlobalState): number {
        return state.datasetsInProgress;
    }
};

const mpaMutations: MutationTree<GlobalState> = {
    SET_ANALYSIS(state: GlobalState, isAnalysing: boolean) {
        state.analysis = isAnalysing;
    },
    SET_SEARCH_SETTINGS(state: GlobalState, searchSettings: MPAConfig): void {
        state.searchSettings = searchSettings;
    },
    SET_ACTIVE_DATASET(state: GlobalState, dataset: Assay | null): void {
        state.activeDataset = dataset;
    },
    SET_SELECTED_TERM(state: GlobalState, value: string): void {
        state.selectedTerm = value;
    },
    SET_SELECTED_TAXON_ID(state: GlobalState, value: number): void {
        state.selectedTaxonId = value;
    },
    INCREASE_DATASETS_IN_PROGRESS(state: GlobalState): void {
        state.datasetsInProgress += 1;
    },
    DECREASE_DATASETS_IN_PROGRESS(state: GlobalState): void {
        state.datasetsInProgress -= 1;
    }
};

const mpaActions: ActionTree<GlobalState, any> = {
    setAnalysis(store: ActionContext<GlobalState, any>, isAnalysing: boolean) {
        store.commit("SET_ANALYSIS", isAnalysing);
    },
    setSearchSettings(store: ActionContext<GlobalState, any>, searchSettings: MPAConfig): void {
        store.commit("SET_SEARCH_SETTINGS", searchSettings);
    },
    setActiveDataset(store: ActionContext<GlobalState, any>, dataset: Assay | null): void {
        store.commit("SET_ACTIVE_DATASET", dataset);
        if (dataset !== null) {
            store.dispatch("setSelectedTerm", "Organism");
            store.dispatch("setSelectedTaxonId", -1);
        }
    },
    processDataset(store: ActionContext<GlobalState, any>, dataset: Assay): void {
        let mpaManager = new MpaAnalysisManager();
        store.commit("INCREASE_DATASETS_IN_PROGRESS");
        mpaManager.processDataset(dataset, store.getters.searchSettings, store.getters.baseUrl)
            .then(() => {
                store.commit("DECREASE_DATASETS_IN_PROGRESS");
                if (store.getters.activeDataset === null) {
                    store.dispatch("setActiveDataset", dataset);
                }
            });
    },
    setSelectedTerm(store: ActionContext<GlobalState, any>, term: string): void {
        store.commit("SET_SELECTED_TERM", term);
    },
    setSelectedTaxonId(store: ActionContext<GlobalState, any>, taxonId: number): void {
        store.commit("SET_SELECTED_TAXON_ID", taxonId);
    }
};

export const GlobalStore = {
    state: mpaState,
    mutations: mpaMutations,
    getters: mpaGetters,
    actions: mpaActions
};
