import { ActionTree, GetterTree, MutationTree } from "vuex";
export interface ConfigurationState {
    baseUrl: string;
}
export declare const ConfigurationStore: {
    state: ConfigurationState;
    mutations: MutationTree<ConfigurationState>;
    getters: GetterTree<ConfigurationState, any>;
    actions: ActionTree<ConfigurationState, any>;
};
