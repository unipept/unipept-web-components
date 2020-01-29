import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import LoadSampleDatasetCard from "./../LoadSampleDatasetCard.vue";
import Setup from "@/test/Setup";
import { sleep, waitForPromises, waitForElement, waitForCondition } from "@/test/Utils";
import SampleDatasetCollection from "@/logic/data-management/SampleDatasetCollection";
import * as expectedSampleData from "@/test/resources/sampledata.json";
import SampleDataset from "@/logic/data-management/SampleDataset";
import { StorageType } from "@/logic/data-management/StorageType";
import { VMenu } from "vuetify/lib";


Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

describe("LoadSampleDatasetCard", () => {
    let vuetify;
    let store;


    beforeEach(() => {
        vuetify = new Vuetify();
    });

    it("correctly loads all available sample datasets", async(done) => {
        const setup: Setup = new Setup();
        setup.setupUnipeptNock();

        const getters = {
            baseUrl: () => "http://unipept.ugent.be"
        }

        store = new Vuex.Store({
            getters
        });

        const wrapper = mount(LoadSampleDatasetCard, {
            store,
            localVue,
            vuetify
        });

        await waitForElement(wrapper, ".load-dataset-button button");

        const sampleDatasets: SampleDatasetCollection[] = wrapper.vm.$data.sampleDatasets;

        // Check if each of the expected dataset collections is present.
        for (const collection of expectedSampleData.sample_data) {
            const foundCollection: SampleDatasetCollection = sampleDatasets.find(item => item.url === collection.url);
            expect(foundCollection).toBeTruthy();

            expect(foundCollection.id).toEqual(collection.id);
            expect(foundCollection.environment).toEqual(collection.environment);
            expect(foundCollection.reference).toEqual(collection.reference);
            expect(foundCollection.projectWebsite).toEqual(collection.project_website);
        }

        expect(sampleDatasets.length).toEqual(expectedSampleData.sample_data.length);

        // Check (for one) sample dataset if the object was constructed correctly.
        const sample7: SampleDataset = sampleDatasets.find(
            item => item.url === "http://www.nature.com/ismej/journal/v3/n2/full/ismej2008108a.html"
        ).datasets.find(d => d.name === "Sample 7");

        expect(sample7).toMatchSnapshot();
        done();
    });

    it("shows an error when retrieving samples fails", async(done) => {
        // By not setting up nock here, we can simulate a failing network request and check if the error is displayed
        // correctly.

        store = new Vuex.Store({});

        const wrapper = mount(LoadSampleDatasetCard, {
            store,
            localVue,
            vuetify
        });

        await waitForElement(wrapper, ".connection-error");

        // Check if the error message is present
        const connectionErrorElement = wrapper.find(".connection-error");
        expect(connectionErrorElement).toBeTruthy();
        expect(connectionErrorElement.html()).toMatchSnapshot();

        done();
    });

    /**
     * This test checks whether the correct metadata for each sample is displayed. This metadata includes the
     * environment, the references and a link to the project website and / or associated publication.
     */
    // it("correctly prints all sample datasets metadata")

    it("correctly fires the create-assay and store-assay event", async(done) => {
        const setup: Setup = new Setup();
        setup.setupUnipeptNock();

        const getters = {
            baseUrl: () => "http://unipept.ugent.be"
        }

        store = new Vuex.Store({
            getters
        });

        const wrapper = mount(LoadSampleDatasetCard, {
            store,
            localVue,
            vuetify
        });
        
        await waitForElement(wrapper, ".load-dataset-button button");

        wrapper.find(".load-dataset-button button").trigger("click");

        await wrapper.vm.$nextTick();

        expect(wrapper.emitted("create-assay")).toBeTruthy();
        expect(wrapper.emitted("store-assay")).toBeTruthy();

        // Sample datasets cannot be stored in persistent storage and thus the storage type should be session storage.
        expect(wrapper.emitted("store-assay")[0][0].getStorageType()).toEqual(StorageType.SessionStorage);

        done();
    });
})
