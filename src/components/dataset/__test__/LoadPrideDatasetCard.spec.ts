import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import LoadPrideDatasetCard from "./../LoadPrideDatasetCard.vue";
import Setup from "@/test/Setup";
import { sleep, waitForPromises } from "@/test/Utils";


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

    it("correctly fires the create-assay and store-assay events", async(done) => {
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

        await waitForPromises(500);

        const fetchPrideButton = wrapper.find(".fetch-pride-button button");
        fetchPrideButton.trigger("click");

        await waitForPromises(500);

        const selectPrideButton = wrapper.find("#select-pride-assay-button button");
        selectPrideButton.trigger("click");

        expect(wrapper.emitted("create-assay")).toBeTruthy();
        expect(wrapper.emitted("store-assay")).toBeTruthy();

        done();
    });
})
