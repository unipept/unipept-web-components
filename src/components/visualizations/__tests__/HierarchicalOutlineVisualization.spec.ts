import { mount, createLocalVue } from "@vue/test-utils"
import Vue from "vue"
import Vuetify from "vuetify"
import Mock from "../../../test/Mock"
import DataRepository from "../../../logic/data-source/DataRepository";
import HierarchicalOutlineVisualization from "./../HierarchicalOutlineVisualization.vue";
import "jsdom-worker-fix";
import Vuex from "vuex";

Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

describe("HierarchicalOutlineVisualization", () => {
    let vuetify;
    let getters;
    let store;

    beforeEach(() => {
        vuetify = new Vuetify();

        getters = {
            selectedTerm: () => "Organism"
        }

        store = new Vuex.Store({
            getters
        });
    });

    it("renders simple datasets", () => {
        let mock: Mock = new Mock();
        let dataRepository: DataRepository = mock.mockDataRepository();
        
        const wrapper = mount(HierarchicalOutlineVisualization, {
            store,
            localVue,
            vuetify,
            propsData: {
                dataRepository: dataRepository
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
