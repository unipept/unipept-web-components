import { shallowMount, createLocalVue, mount, Wrapper } from "@vue/test-utils";
import ExperimentSummaryCard from "./../ExperimentSummaryCard.vue";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex, { Store } from "vuex";
import Mock from "@/test/Mock";
import { CombinedVueInstance } from "vue/types/vue";
import { waitForPromises, waitForElement, waitForCondition } from "@/test/Utils";
import ProteomicsAssay from "@/business/entities/assay/ProteomicsAssay";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import Setup from "@/test/Setup";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";
import { createAssayStore } from "@/state/AssayStore";

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

    beforeEach(() => {
        vuetify = new Vuetify();
        const setup = new Setup();
        setup.setupAll();
    });

    it("correctly renders all items that are currently present", async(done) => {
        const mock: Mock = new Mock();
        const assay: ProteomicsAssay = await mock.mockRealisticAssay();

        const wrapper = await mountComponent(vuetify, assay, new SearchConfiguration());

        await waitForCondition(() => !wrapper.vm.$data.loading);

        expect(wrapper.find(".peptide-match-text").html()).toMatchSnapshot();
        done();
    });

    it("correctly renders a placeholder when no dataset is selected", async(done) => {
        const wrapper = await mountComponent(vuetify, null, new SearchConfiguration());
        expect(wrapper.find(".dataset-placeholder-text").html()).toMatchSnapshot();
        done();
    });

    it("opens a dialog when clicking the missed peptides text", async(done) => {
        // Fix for Vuetify warn in combination with Jest and Dialogs
        const app = document.createElement("div");
        app.setAttribute("data-app", "");
        document.body.append(app);

        const mock: Mock = new Mock();
        const assay: ProteomicsAssay = await mock.mockRealisticAssay();

        const wrapper = await mountComponent(vuetify, assay, new SearchConfiguration());

        // The dialog should not be open when first loading the component.
        expect(wrapper.find(".v-dialog--active").exists()).toBeFalsy();
        await waitForElement(wrapper, ".peptide-match-text a");
        wrapper.find(".peptide-match-text a").trigger("click");
        // After clicking the peptide-match-text, the dialog should open.
        expect(wrapper.find(".v-dialog--active").exists()).toBeTruthy();

        done();
    });
});

/**
 * Mount the ExperimentSummaryCard-component with a valid lists of assays in the store and a valid activeDataset
 * entry in the Vuex store.
 *
 * @param vuetify A valid Vuetify instance that should be used during the tests.
 * @param activeAssay The assay that's currently selected by the user.
 * @param searchConfiguration The currently chosen search configuration for processing peptides.
 */
const mountComponent = async function(
    vuetify,
    activeAssay: ProteomicsAssay,
    searchConfiguration: SearchConfiguration
): Promise<Wrapper<CombinedVueInstance<ExperimentSummaryCard, object, object, object, Record<never, any>>>> {
    const getters = {
        selectedTerm: () => "Organism",
        searchSettings: () => {
            return {
                il: true,
                dupes: true,
                missed: false
            }
        }
    };

    const store = new Vuex.Store({
        getters
    });

    return mount(ExperimentSummaryCard, {
        store,
        localVue,
        vuetify,
        propsData: {
            activeAssay: activeAssay,
            disabled: false,
            searchConfiguration: searchConfiguration,
            communicationSource: new DefaultCommunicationSource()
        }
    });
}
