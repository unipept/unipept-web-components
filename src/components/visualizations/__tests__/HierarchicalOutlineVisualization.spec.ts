import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vue from "vue"
import Vuetify from "vuetify"
import Mock from "@/test/Mock"
import DataRepository from "@/logic/data-source/DataRepository";
import HierarchicalOutlineVisualization from "./../HierarchicalOutlineVisualization.vue";
import "jsdom-worker-fix";

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("HierarchicalOutlineVisualization", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    it("renders simple datasets", () => {
        let mock: Mock = new Mock();
        let dataRepository: DataRepository = mock.mockDataRepository();
        
        const wrapper = shallowMount(HierarchicalOutlineVisualization, {
            localVue,
            vuetify,
            propsData: {
                dataRepository: dataRepository
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
