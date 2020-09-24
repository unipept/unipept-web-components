import Setup from "@/test/Setup";
import Vue from "vue"
import Vuetify from "vuetify"
import { createLocalVue, mount } from "@vue/test-utils";
import { waitForCondition, waitForElement } from "@/test/Utils";
import SingleInterproSummaryCard from "@/components/analysis/single/SingleInterproSummaryCard.vue";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("SingleInterproSummaryCard", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("correctly displays the correct InterPro-entries for a given peptide", async() => {
        const wrapper = mount(SingleInterproSummaryCard, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true,
                communicationSource: new DefaultCommunicationSource()
            }
        });

        // Wait for the table to be rendered.
        await waitForCondition(() => wrapper.findAll("tr").length > 1);

        // We sort the proteins by code, to make the test deterministic
        const sortButton = wrapper.findAll("th").filter(w => w.html().includes("Interpro entry")).at(0);
        sortButton.trigger("click");

        // Wait for this element to be the first in the table, which means sorting is done
        await waitForCondition(() => wrapper.find("tbody tr").html().includes("IPR042201"));

        // We know that the following IPR-entries are associated with the AALTER peptide, and should thus be present.
        const trs = wrapper.findAll("tbody tr");
        expect(trs.at(0).html().includes("IPR000225")).toBeTruthy();
        expect(trs.at(1).html().includes("IPR003613")).toBeTruthy();
        expect(trs.at(2).html().includes("IPR009767")).toBeTruthy();

        // Make sure the total count of items is correct.
        expect(wrapper.find(".v-data-footer__pagination").text()).toEqual("1-9 of 9");
    });

    it("displays the correct trust line", async() => {
        const wrapper = mount(SingleInterproSummaryCard, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true,
                communicationSource: new DefaultCommunicationSource()
            }
        });

        await wrapper.vm.$nextTick();

        // Wait for the table to be rendered.
        await waitForCondition(() => wrapper.find(".interpro-trust").exists() && wrapper.find(".interpro-trust").html().includes("have at least"));

        expect(wrapper.find(".interpro-trust").html()).toMatchSnapshot();
    });
});
