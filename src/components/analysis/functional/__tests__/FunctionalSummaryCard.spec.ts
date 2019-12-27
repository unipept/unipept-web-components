import { shallowMount, createLocalVue, mount, Wrapper } from "@vue/test-utils";
import ExperimentSummaryCard from "./../ExperimentSummaryCard.vue";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex, { Store } from "vuex";
import Mock from "@/test/Mock";
import Assay from "@/logic/data-management/assay/Assay";
import flushPromises from "flush-promises";
import TestUtils from "@/test/TestUtils";
import { CombinedVueInstance } from "vue/types/vue";
import { GlobalStore } from "@/state/GlobalStore";

Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

describe("FunctionalSummaryCard", () => {
    let vuetify;
    let store;

    beforeEach(() => {
        vuetify = new Vuetify();
        store = new Vuex.Store(GlobalStore);
    });

    it("correctly shows progress bars when data is selected and still loding", (done) => {
        
    });

    // it("correctly shows placeholders when no data has been selected");
});


