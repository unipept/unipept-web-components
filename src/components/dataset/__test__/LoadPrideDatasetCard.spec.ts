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
import Setup from "@/test/Setup";
import { sleep } from "@/test/Utils";
import { VMenu } from "vuetify/lib";


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

    it("correctly fires create-assay event", async(done) => {
        const wrapper = mount(LoadPrideDatasetCard, {
            store,
            localVue,
            vuetify,
            data: function() {
                return {
                    prideAssay: 2600
                }
            }
        });

        let setup: Setup = new Setup();
        setup.setUpPrideNock();

        await sleep(1000);
        await flushPromises();

        let fetchPrideButton = wrapper.find(".fetch-pride-button button");
        fetchPrideButton.trigger("click");

        // Now check if the required peptides are loaded into the textfield
        await sleep(500);
        await flushPromises();

        wrapper.vm.$nextTick(() => {
            expect(wrapper.vm.$data.pridePeptides).toMatchSnapshot();
            done();
        });
    });
})
