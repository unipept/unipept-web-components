import { shallowMount, createLocalVue, mount, Wrapper } from "@vue/test-utils";
import ExperimentSummaryCard from "./../ExperimentSummaryCard.vue";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex, { Store } from "vuex";
import Mock from "@/test/Mock";
import Assay from "@/logic/data-management/assay/Assay";
import { CombinedVueInstance } from "vue/types/vue";
import { waitForPromises } from "@/test/Utils";

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

        await waitForPromises(1000);

        expect(wrapper.find(".peptide-match-text").html()).toMatchSnapshot();
        done();
    });

    it("correctly renders a placeholder when no dataset is selected", async(done) => {
        const wrapper = await mountWithoutDatasets(vuetify);
        expect(wrapper.find(".dataset-placeholder-text").html()).toMatchSnapshot();
        done();
    });

    it("opens a dialog when clicking the missed peptides text", async(done) => {
        // Fix for Vuetify warn in combination with Jest and Dialogs 
        const app = document.createElement("div");
        app.setAttribute("data-app", "");
        document.body.append(app);

        const wrapper = await mountWithValidDatasets(vuetify);
    
        // The dialog should not be open when first loading the component.
        expect(wrapper.find(".v-dialog--active").exists()).toBeFalsy();
        wrapper.find(".peptide-match-text a").trigger("click");
        // After clicking the peptide-match-text, the dialog should open.
        expect(wrapper.find(".v-dialog--active").exists()).toBeTruthy();

        done();
    });
});

const getValidStore = async function(actions = null): Promise<Store<unknown>> {
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
        selectedDatasets: () => [assay]
    };

    let store;

    if (actions !== null) {
        store = new Vuex.Store({
            actions,
            getters
        });
    } else {
        store = new Vuex.Store({
            getters
        });
    }

    return store;
}

/**
 * Mount the ExperimentSummaryCard-component with a valid lists of assays in the store and a valid activeDataset
 * entry in the Vuex store.
 * 
 * @param vuetify A valid Vuetify instance that should be used during the tests.
 */
const mountWithValidDatasets = async function(vuetify, actions = null): Promise<Wrapper<CombinedVueInstance<ExperimentSummaryCard, object, object, object, Record<never, any>>>> {
    const store = await getValidStore(actions);

    return mount(ExperimentSummaryCard, {
        store,
        localVue,
        vuetify,
        propsData: {
            activeAssay: store.getters.selectedDatasets[0]
        }
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
        selectedDatasets: () => []
    };

    const store = new Vuex.Store({
        getters
    });

    return mount(ExperimentSummaryCard, {
        store,
        localVue,
        vuetify,
        propsData: {
            activeAssay: null
        }
    });
}
