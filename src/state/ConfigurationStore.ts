import { ActionContext, ActionTree, GetterTree, MutationTree } from "vuex";

export interface ConfigurationState {
    baseUrl: string
}

const configState: ConfigurationState = {
    baseUrl: ""
}

const configGetters: GetterTree<ConfigurationState, any> = {
    baseUrl(state: ConfigurationState): string {
        return state.baseUrl;
    }
}

const configMutations: MutationTree<ConfigurationState> = {
    SET_BASE_URL(state: ConfigurationState, url: string): void {
        state.baseUrl = url;
    }
}

const configActions: ActionTree<ConfigurationState, any> = {
    setBaseUrl(store: ActionContext<ConfigurationState, any>, url: string): void {
        store.commit("SET_BASE_URL", url);
    }
}

export const ConfigurationStore = {
    state: configState,
    mutations: configMutations,
    getters: configGetters,
    actions: configActions
}
