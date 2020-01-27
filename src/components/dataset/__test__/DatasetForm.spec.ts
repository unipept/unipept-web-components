import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import DatasetForm from "./../DatasetForm.vue";
import Setup from "@/test/Setup";
import { sleep, waitForPromises } from "@/test/Utils";
import Assay from "@/logic/data-management/assay/Assay";
import MetaProteomicsAssay from "@/logic/data-management/assay/MetaProteomicsAssay";


Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

describe("DatasetForm", () => {
    let vuetify;
    let getters;
    let store;

    beforeEach(() => {
        vuetify = new Vuetify();
        store = new Vuex.Store({});
    });

    it("correctly fires the peptide-change event", async(done) => {
        const peptides: string = "AALTER\nAAAAA\n";

        const wrapper = mount(DatasetForm, {
            store,
            localVue,
            vuetify
        });

        await waitForPromises(1000);

        const peptidesTextField = wrapper.find("#qs-textarea");
        peptidesTextField.setValue(peptides);

        await waitForPromises(500);

        expect(wrapper.emitted("peptide-change")[0][0]).toEqual(peptides);

        done();
    });

    it("correctly fires the name-change event", async(done) => {
        const name: string = "Test";

        const wrapper = mount(DatasetForm, {
            store,
            localVue,
            vuetify
        });

        await waitForPromises(1000);

        const nameInput = wrapper.find("#name-input");
        nameInput.setValue(name);

        await waitForPromises(500);


        expect(wrapper.emitted("name-change")[0][0]).toEqual(name);

        done();
    });

    it("correctly fires the save-change event", async(done) => {
        const peptides: string = "AALTER\nAAAAA\n";
        const name: string = "Test";

        const wrapper = mount(DatasetForm, {
            store,
            localVue,
            vuetify,
            propsData: {
                save: false
            }
        });

        await waitForPromises(1000);

        const saveCheckbox = wrapper.find("#save-checkbox");
        saveCheckbox.trigger("click");

        await waitForPromises(500);

        expect(wrapper.emitted("save-change")[0][0]).toBeTruthy();

        done();
    });

    it("correctly validates the form", async(done) => {
        const peptides: string = "AALTER\nAAAAA\n";
        const name: string = "Test";

        const wrapper = mount(DatasetForm, {
            store,
            localVue,
            vuetify
        });

        await waitForPromises(1000);

        // Nothing is filled in and the form validation should return false.
        expect((wrapper.vm as any).isValid()).toBeFalsy();

        const peptidesTextField = wrapper.find("#qs-textarea");
        peptidesTextField.setValue(peptides);

        const nameInput = wrapper.find("#name-input");
        nameInput.setValue(name);

        // Valid inputs have been filled and the form validation should now return true.
        expect((wrapper.vm as any).isValid()).toBeTruthy();

        done();
    });
})
