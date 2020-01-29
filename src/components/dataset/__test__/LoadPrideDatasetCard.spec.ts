import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import LoadPrideDatasetCard from "./../LoadPrideDatasetCard.vue";
import Setup from "@/test/Setup";
import { sleep, waitForPromises, waitForElement, waitForCondition } from "@/test/Utils";


Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

describe("LoadPrideDatasetCard", () => {
    let vuetify;
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

        await waitForElement(wrapper, ".fetch-pride-button button");

        const fetchPrideButton = wrapper.find(".fetch-pride-button button");
        fetchPrideButton.trigger("click");

        // Now check if the required peptides are loaded into the textfield
        await wrapper.vm.$nextTick();
        await waitForCondition(() => !wrapper.vm.$data.prideLoading);

        expect(wrapper.vm.$data.pridePeptides).toMatchSnapshot();
        done();
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

        await waitForElement(wrapper, ".fetch-pride-button button");

        const fetchPrideButton = wrapper.find(".fetch-pride-button button");
        fetchPrideButton.trigger("click");

        await wrapper.vm.$nextTick();
        await waitForCondition(() => !wrapper.vm.$data.prideLoading);

        const selectPrideButton = wrapper.find("#select-pride-assay-button button");
        selectPrideButton.trigger("click");

        await wrapper.vm.$nextTick();

        expect(wrapper.emitted("create-assay")).toBeTruthy();
        expect(wrapper.emitted("store-assay")).toBeTruthy();

        done();
    });
})
