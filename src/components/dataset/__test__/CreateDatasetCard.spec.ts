import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import CreateDatasetCard from "./../CreateDatasetCard.vue";
import Setup from "@/test/Setup";
import { sleep, waitForPromises } from "@/test/Utils";
import Assay from "@/logic/data-management/assay/Assay";
import MetaProteomicsAssay from "@/logic/data-management/assay/MetaProteomicsAssay";


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

        await waitForPromises(1000);

        const createAssayButton = wrapper.find("#create-assay-button button");
        createAssayButton.trigger("click");

        await waitForPromises(500);

        const createdAssay: MetaProteomicsAssay = wrapper.emitted("store-assay")[0][0] as MetaProteomicsAssay;

        expect(createdAssay.peptideContainer.getPeptides()).toEqual(peptides.split("\n"));
        expect(createdAssay.getName()).toEqual(name);

        done();
    });
})
