import { shallowMount, createLocalVue, mount, Wrapper } from "@vue/test-utils";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import LoadLocalDatasetCard from "./../LoadLocalDatasetCard.vue";
import Setup from "@/test/Setup";
import Mock from "@/test/Mock";
import { sleep, waitForPromises, waitForElement, waitForCondition } from "@/test/Utils";
import { CombinedVueInstance } from "vue/types/vue";
import ProteomicsAssay from "@/business/entities/assay/ProteomicsAssay";


Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

describe("LoadLocalDatasetCard", () => {
    let vuetify;
    let store;

    beforeEach(() => {
        vuetify = new Vuetify();
        store = new Vuex.Store({});
    });

    it("shows a placeholder if no datasets are present", async(done) => {
        const setup: Setup = new Setup();
        setup.setUpPrideNock();

        const wrapper = mount(LoadLocalDatasetCard, {
            store,
            localVue,
            vuetify,
            propsData: {
                storedAssays: []
            }
        });

        await waitForElement(wrapper, "#empty-dataset-placeholder");
        expect(wrapper.find("#empty-dataset-placeholder").html()).toMatchSnapshot();
        done();
    });

    it("shows a confirmation dialog before removing a dataset", async(done) => {
        const wrapper = await mountWithAssay(store, vuetify);

        await waitForElement(wrapper, ".remove-assay-button");
        wrapper.find(".remove-assay-button").trigger("click");

        await wrapper.vm.$nextTick();

        // Check if the dialog is active.
        expect(wrapper.find(".remove-confirmation-dialog .v-dialog").classes()).toContain("v-dialog--active");

        done();
    });

    it("correctly fires destroy-assay event after user confirmation", async(done) => {
        const wrapper = await mountWithAssay(store, vuetify);

        await waitForElement(wrapper, ".remove-assay-button");
        wrapper.find(".remove-assay-button").trigger("click");

        await wrapper.vm.$nextTick();
        wrapper.find(".confirmation-ok-button").trigger("click");

        await wrapper.vm.$nextTick();

        // Make sure that the destroy-assay event is fired
        expect(wrapper.emitted("destroy-assay")).toBeTruthy();

        done();
    });

    it("does not remove a dataset after clicking cancel on the confirmation", async(done) => {
        const wrapper = await mountWithAssay(store, vuetify);

        await waitForElement(wrapper, ".remove-assay-button");
        wrapper.find(".remove-assay-button").trigger("click");

        await wrapper.vm.$nextTick();
        wrapper.find(".confirmation-cancel-button").trigger("click");

        await wrapper.vm.$nextTick();

        // Make sure that the destroy-assay event is fired
        expect(wrapper.emitted("destroy-assay")).toBeFalsy();

        done();
    });

    it("correctly fires the create-assay event (and does not fire store-assay)", async(done) => {
        const wrapper = await mountWithAssay(store, vuetify);

        await waitForElement(wrapper, ".stored-assays-list .v-list-item");
        wrapper.find(".stored-assays-list .v-list-item").trigger("click");

        await wrapper.vm.$nextTick();

        expect(wrapper.emitted("create-assay")).toBeTruthy();
        expect(wrapper.emitted("store-assay")).toBeFalsy();

        done();
    });
});

const mountWithAssay = async function(store, vuetify): Promise<Wrapper<CombinedVueInstance<LoadLocalDatasetCard, object, object, object, Record<never, any>>>> {
    const setup: Setup = new Setup();
    setup.setUpPrideNock();

    const mock: Mock = new Mock();
    const assay: ProteomicsAssay = await mock.mockRealisticAssay();

    return mount(LoadLocalDatasetCard, {
        store,
        localVue,
        vuetify,
        propsData: {
            storedAssays: [assay]
        }
    })
}
