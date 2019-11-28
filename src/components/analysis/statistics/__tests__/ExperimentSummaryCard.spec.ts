import { shallowMount, createLocalVue, mount, Wrapper } from "@vue/test-utils";
import ExperimentSummaryCard from "./../ExperimentSummaryCard.vue";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex, { Store } from "vuex";
import Mock from "@/test/Mock";
import Assay from "@/logic/data-management/assay/Assay";
import flushPromises from "flush-promises";
import TestUtils from "@/test/TestUtils";
import { CombinedVueInstance } from "vue/types/vue";
import MPAConfig from "@/logic/data-management/MPAConfig";

Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

// These peptides should be found by the tests
const foundPeptides: string[] = [
    "SGLAPFYSDK",
    "AAANESFGYNEDELVSSDLVGMR",
    "LAEEVLR",
    "YEVGTMLELPR",
    "TNTLLQSAFFK",
    "ANFEGECSEVGMYLAMAR",
    "MEVAVGDK",
    "LLDLGVLVGSGYHVNPK",
    "VYFLNFKPESSDEWK",
    "LGLVAVSR"
];

describe("ExperimentSummaryCard", () => {
    let vuetify;
    let getters;
    let store;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    it("correctly renders all items that are currently present", async(done) => {
        const wrapper = await mountWithValidDatasets(vuetify);

        await TestUtils.sleep(1000);
        await flushPromises();

        expect(wrapper.find(".peptide-match-text").html()).toMatchSnapshot();
        done();
    });

    it("correctly renders a placeholder when no dataset is selected", async(done) => {
        const wrapper = await mountWithoutDatasets(vuetify);
        expect(wrapper.find(".dataset-placeholder-text").html()).toMatchSnapshot();
        done();
    });

    it("correctly updates search settings when clicking update", async(done) => {
        const mock: Mock = new Mock();
        const assay: Assay = await mock.mockInitializedAssay();

        const actions = {
            setSearchSettings: jest.fn(),
            setActiveDataset: jest.fn(),
            processDataset: jest.fn(),
        }

        const getters = {
            selectedTerm: () => "Organism",
            searchSettings: () => {
                return {
                    il: true,
                    dupes: true,
                    missed: false
                }
            },
            selectedDatasets: () => [assay],
            activeDataset: () => assay,
        };

        const store = new Vuex.Store({
            actions,
            getters
        });

        const wrapper = await mount(ExperimentSummaryCard, {
            store,
            localVue,
            vuetify
        });

        wrapper.find(".card-actions button").trigger("click");
        // Check that the function did inform the store of the current values
        expect(actions.setSearchSettings).toBeCalled();
        expect(actions.setSearchSettings.mock.calls[0][1]).toEqual({
            il: true,
            dupes: true,
            missed: false
        });

        actions.setSearchSettings.mockReset();

        // Now we change the search settings-values
        wrapper.find(".search-settings-form input").trigger("click");
        wrapper.find(".card-actions button").trigger("click");

        // Check that different search settings are now being used in the store.
        expect(actions.setSearchSettings).toBeCalled();
        expect(actions.setSearchSettings.mock.calls[0][1]).toEqual({
            il: false,
            dupes: true,
            missed: false
        });

        done();
    });

    it("opens a dialog when clicking the missed peptides text", async(done) => {
        // Fix for Vuetify warn in combination with Jest and Dialogs
        const app = document.createElement("div");
        app.setAttribute("data-app", "");
        document.body.append(app);

        const wrapper = await mountWithValidDatasets(vuetify);
    
        expect(wrapper.find(".v-dialog--active").exists()).toBeFalsy();
        wrapper.find(".peptide-match-text a").trigger("click");
        expect(wrapper.find(".v-dialog--active").exists()).toBeTruthy();

        done();
    });
});

const getValidStore = async function(): Promise<Store<unknown>> {
    const mock: Mock = new Mock();
    const assay: Assay = await mock.mockInitializedAssay();
    const getters = {
        selectedTerm: () => "Organism",
        searchSettings: () => {
            return {
                il: true,
                dupes: true,
                missed: false
            }
        },
        selectedDatasets: () => [assay],
        activeDataset: () => assay,
    };

    const store = new Vuex.Store({
        getters
    });

    return store;
}

/**
 * Mount the ExperimentSummaryCard-component with a valid lists of assays in the store and a valid activeDataset
 * entry in the Vuex store.
 * 
 * @param vuetify A valid Vuetify instance that should be used during the tests.
 */
const mountWithValidDatasets = async function(vuetify): Promise<Wrapper<CombinedVueInstance<ExperimentSummaryCard, object, object, object, Record<never, any>>>> {
    const store = await getValidStore();

    return mount(ExperimentSummaryCard, {
        store,
        localVue,
        vuetify
    });
}

/**
 * Mount the ExperimentSummaryCard-component without valid assay.
 * 
 * @param vuetify A valid Vuetify instance that should be used during the tests.
 */
const mountWithoutDatasets = async function(vuetify): Promise<Wrapper<CombinedVueInstance<ExperimentSummaryCard, object, object, object, Record<never, any>>>> {
    const getters = {
        selectedTerm: () => "Organism",
        searchSettings: () => {
            return {
                il: true,
                dupes: true,
                missed: false
            }
        },
        selectedDatasets: () => [],
        activeDataset: () => null,
    };

    const store = new Vuex.Store({
        getters
    });

    return mount(ExperimentSummaryCard, {
        store,
        localVue,
        vuetify
    });
}
