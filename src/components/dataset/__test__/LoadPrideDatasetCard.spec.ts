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
import { sleep, waitForPromises } from "@/test/Utils";
import { VMenu } from "vuetify/lib";
import { select } from "d3";
import MetaGenomicsAssay from "@/logic/data-management/assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "@/logic/data-management/assay/MetaProteomicsAssay";


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

    it("correctly loads a set of PRIDE peptides", async(done) => {
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

        const setup: Setup = new Setup();
        setup.setUpPrideNock();

        await waitForPromises(1000);

        const fetchPrideButton = wrapper.find(".fetch-pride-button button");
        fetchPrideButton.trigger("click");

        // Now check if the required peptides are loaded into the textfield
        await waitForPromises(500);

        wrapper.vm.$nextTick(() => {
            expect(wrapper.vm.$data.pridePeptides).toMatchSnapshot();
            done();
        });
    });

    it("correctly fires the create-assay event", async(done) => {
        const wrapper = mount(LoadPrideDatasetCard, {
            store,
            localVue,
            vuetify,
            data: function() {
                return {
                    prideAssay: 2600,
                    prideSave: false
                }
            }
        });

        const setup: Setup = new Setup();
        setup.setUpPrideNock();

        await waitForPromises(500);

        const fetchPrideButton = wrapper.find(".fetch-pride-button button");
        fetchPrideButton.trigger("click");

        await waitForPromises(500);

        const selectPrideButton = wrapper.find("#select-pride-assay-button button");
        selectPrideButton.trigger("click");

        expect(wrapper.emitted("create-assay")).toBeTruthy();
        expect(wrapper.emitted("store-assay")).toBeTruthy();

        done();
    })
})
