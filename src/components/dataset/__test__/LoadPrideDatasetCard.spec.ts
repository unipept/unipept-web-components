import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import MissingPeptidesList from "./../MissingPeptidesList.vue";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import Mock from "@/test/Mock";
import Assay from "@/logic/data-management/assay/Assay";
import flushPromises from "flush-promises";
import Utils from "./../../custom/Utils";
import LoadPrideDatasetCard from "./../LoadPrideDatasetCard.vue";


Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

describe("LoadPrideDatasetCard", () => {
    let vuetify;
    let getters;
    let store;

    beforeEach(() => {
        vuetify = new Vuetify();

        store = new Vuex.Store({});
    });

    it("correctly fires create-assay event", (done) => {
        const wrapper = mount(LoadPrideDatasetCard, {
            store,
            localVue,
            vuetify
        });

        let assayIdInput = wrapper.find(".assay-id-input");
        assayIdInput.setValue("8500");

        let fetchPrideButton = wrapper.find(".fetch-pride-button");
        fetchPrideButton.trigger("click");

        expect(wrapper.find(".assay-id-input")).toMatchSnapshot();

        done();
    });
})
