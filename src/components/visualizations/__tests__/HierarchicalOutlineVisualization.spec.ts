import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vue from "vue"
import Vuetify from "vuetify"

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("HierarchicalOutlineVisualization", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    it("renders simple datasets", () => {
        
    });
});
