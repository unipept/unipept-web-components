import Vue from "vue"
import Vuetify from "vuetify"
import { createLocalVue, mount } from "@vue/test-utils";
import Setup from "@/test/Setup";
import SinglePeptideSummary from "@/components/analysis/single/SinglePeptideSummary.vue";
import { waitForElement } from "@/test/Utils";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("SinglePeptideSummary", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("correctly shows a complete summary for one peptide", async() => {
        const wrapper = mount(SinglePeptideSummary, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true,
                communicationSource: new DefaultCommunicationSource("http://unipept.ugent.be")
            }
        });

        await wrapper.vm.$nextTick();

        await waitForElement(wrapper, ".headline");

        expect(wrapper.html()).toMatchSnapshot();
    });
});
