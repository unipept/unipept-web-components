import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import CreateDatasetCard from "./../CreateDatasetCard.vue";
import Setup from "@/test/Setup";
import { sleep, waitForPromises, waitForElement } from "@/test/Utils";
import ProteomicsAssay from "@/business/entities/assay/ProteomicsAssay";

Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

describe("CreateDatasetCard", () => {
    let vuetify;
    let getters;
    let store;

    beforeEach(() => {
        vuetify = new Vuetify();
        store = new Vuex.Store({});
    });

    /**
     * Check if this card correctly creates a new Assay with the required properties filled in. By doing this, we can
     * test whether the correct events, emitted by the DatasetForm, are handled.
     *
     * Both the store-assay and create-assay events should be emitted by this card.
     */
    it("correctly creates a new assay", async(done) => {
        const peptides: string = "AALTER\nAAAAA\n";
        const name: string = "Test";

        const wrapper = mount(CreateDatasetCard, {
            store,
            localVue,
            vuetify,
            data: function() {
                return {
                    createPeptides: peptides,
                    createName: name,
                    createSave: true
                }
            }
        });

        await waitForElement(wrapper, "#create-assay-button button");

        const createAssayButton = wrapper.find("#create-assay-button button");
        createAssayButton.trigger("click");

        await wrapper.vm.$nextTick();

        const createdAssay: ProteomicsAssay = wrapper.emitted("store-assay")[0][0] as ProteomicsAssay;

        expect(createdAssay.getPeptides()).toEqual(peptides.split("\n"));
        expect(createdAssay.getName()).toEqual(name);

        done();
    });
})
