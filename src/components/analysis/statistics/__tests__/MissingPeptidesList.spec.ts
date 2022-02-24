import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import MissingPeptidesList from "./../MissingPeptidesList.vue";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import Mock from "@/test/Mock";
import Utils from "./../../../custom/Utils";
import { sleep, waitForElement } from "./../../../../test/Utils";
import Setup from "@/test/Setup";
import { Peptide } from "@/business/ontology/raw/Peptide";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";
import PeptideTrustProcessor from "@/business/processors/raw/PeptideTrustProcessor";

jest.mock("./../../../custom/Utils");

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
    let missedPeptides: Peptide[];

    beforeEach(async() => {
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

        const setup = new Setup();
        setup.setupAll();

        const mock: Mock = new Mock();
        const countTable = await mock.mockRealisticPeptideCountTable();

        const communicationSource = new DefaultCommunicationSource("http://unipept.ugent.be");
        const pept2DataCommunicator = communicationSource.getPept2DataCommunicator();
        const [pept2data, peptideTrust] = await pept2DataCommunicator.process(countTable, new SearchConfiguration());

        missedPeptides = peptideTrust.missedPeptides;
    });

    it("correctly renders all peptides", async(done) => {
        const wrapper = mount(MissingPeptidesList, {
            store,
            localVue,
            vuetify,
            propsData: {
                missedPeptides: missedPeptides
            }
        });

        await waitForElement(wrapper, "div > div");

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

    it("correctly copies items to clipboard", async(done) => {
        const wrapper = mount(MissingPeptidesList, {
            store,
            localVue,
            vuetify,
            propsData: {
                missedPeptides: missedPeptides
            }
        });

        await waitForElement(wrapper, ".copy-button-container button");

        wrapper.find(".copy-button-container button").trigger("click");
        await wrapper.vm.$nextTick();

        const content: string = await navigator.clipboard.readText();
        expect(content).toMatchSnapshot();
        done();
    });

    it("opens the correct URL for a peptide", async(done) => {
        const wrapper = mount(MissingPeptidesList, {
            store,
            localVue,
            vuetify,
            propsData: {
                missedPeptides: missedPeptides
            }
        });

        await waitForElement(wrapper, "td.text-center .v-icon", 2000);
        wrapper.find("td.text-center .v-icon").trigger("click");
        await wrapper.vm.$nextTick();

        const expectedUrl: string = "http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&SET_SAVED_SEARCH=on" +
        "&USER_FORMAT_DEFAULTS=on&PAGE=Proteins&PROGRAM=blastp&QUERY=" + foundPeptides[0] + "&GAPCOSTS=11%201" +
        "&EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&DATABASE=nr" +
        "&BLAST_PROGRAMS=blastp&MAX_NUM_SEQ=100&SHORT_QUERY_ADJUST=on&EXPECT=10&WORD_SIZE=3" +
        "&MATRIX_NAME=BLOSUM62&COMPOSITION_BASED_STATISTICS=2&SHOW_OVERVIEW=on&SHOW_LINKOUT=on" +
        "&ALIGNMENT_VIEW=Pairwise&MASK_CHAR=2&MASK_COLOR=1&GET_SEQUENCE=on&NEW_VIEW=on&NUM_OVERVIEW=100" +
        "&DESCRIPTIONS=100&ALIGNMENTS=100&FORMAT_OBJECT=Alignment&FORMAT_TYPE=HTML&OLD_BLAST=false"

        expect(Utils.openInBrowser).toBeCalledWith(expectedUrl);
        done();
    });
})

