import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import MissingPeptidesList from "./../MissingPeptidesList.vue";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import Mock from "@/test/Mock";
import Assay from "@/logic/data-management/assay/Assay";
import flushPromises from "flush-promises"

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

describe("MissingPeptidesList", () => {
    let vuetify;
    let getters;
    let store;

    beforeEach(() => {
        vuetify = new Vuetify();

        getters = {
            selectedTerm: () => "Organism",
            searchSettings: () => {
                return {
                    il: true,
                    dupes: true,
                    missed: false
                }
            }
        }

        store = new Vuex.Store({
            getters
        });
    });

    it("correctly renders all peptides", (done) => {
        let mock: Mock = new Mock();
        mock.mockInitializedAssay().then(async(assay: Assay) => {
            const wrapper = mount(MissingPeptidesList, {
                store,
                localVue,
                vuetify,
                propsData: {
                    dataset: assay 
                }
            });
    
            await sleep(1000);
            await flushPromises();

            // Test whether the calculated amount of missing peptides is correct.
            expect(wrapper.find("div > div").html()).toContain("we didn't manage to find 10 of your");
            expect(wrapper.find("div > div").html()).toMatchSnapshot();

            const dataTable = wrapper.find(".v-data-table").html();

            for (let peptide of foundPeptides) {
                expect(dataTable).toContain(peptide);
            }

            // Test if no more peptides are rendered.
            expect(wrapper.findAll("td.text-left").length).toEqual(10);

            done();
        });
    })

    it("correctly copies items to clipboard", (done) => {
        let mock: Mock = new Mock();
        mock.mockInitializedAssay().then(async(assay: Assay) => {
            const wrapper = mount(MissingPeptidesList, {
                store,
                localVue,
                vuetify,
                propsData: {
                    dataset: assay 
                }
            });
    
            await sleep(1000);
            await flushPromises();

            wrapper.find(".copy-button-container button").trigger("click");
            wrapper.vm.$nextTick(async() => {
                const content: string = await navigator.clipboard.readText();
                expect(content).toMatchSnapshot();
            })
            done();
        });
    })
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

