import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import ExperimentSummaryCard from "./../ExperimentSummaryCard.vue";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import Mock from "@/test/Mock";
import Assay from "@/logic/data-management/assay/Assay";
import flushPromises from "flush-promises";
import TestUtils from "@/test/TestUtils";

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
        let mock: Mock = new Mock();
        mock.mockInitializedAssay().then(async(assay: Assay) => {
            getters = {
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
    
            store = new Vuex.Store({
                getters
            });

            const wrapper = mount(ExperimentSummaryCard, {
                store,
                localVue,
                vuetify
            });

            await TestUtils.sleep(1000);
            await flushPromises();

            expect(wrapper.find(".peptide-match-text").html()).toMatchSnapshot();
            done();
        });
    });

    it("correctly renders a placeholder when no dataset is selected", async(done) => {
        getters = {
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

        store = new Vuex.Store({
            getters
        });

        const wrapper = mount(ExperimentSummaryCard, {
            store,
            localVue,
            vuetify
        });

        expect(wrapper.find(".dataset-placeholder-text").html()).toMatchSnapshot();
        done();
    });

    it("correctly updates search settings when clicking update", async(done) => {
        done();
    });
})
