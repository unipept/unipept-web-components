import Vue from "vue"
import Vuetify from "vuetify"
import { createLocalVue, mount } from "@vue/test-utils";
import { waitForCondition, waitForElement } from "@/test/Utils";
import Setup from "@/test/Setup";
import SingleEcSummaryCard from "@/components/analysis/single/SingleEcSummaryCard.vue";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("SingleEcSummaryCard", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("correctly displays the correct EC-entries for a given peptide", async() => {
        const wrapper = mount(SingleEcSummaryCard, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true,
                communicationSource: new DefaultCommunicationSource("http://unipept.ugent.be")
            }
        });

        await wrapper.vm.$nextTick();

        // Wait for the table to be rendered.
        await waitForCondition(() => wrapper.findAll("tr").length > 1);

        // We sort the proteins by code, to make the test deterministic
        const sortButton = wrapper.findAll("th").filter(w => w.html().includes("EC number")).at(0);
        sortButton.trigger("click");

        // Wait for this element to be the first in the table, which means sorting is done
        await waitForCondition(() => wrapper.find("tbody tr").html().includes("EC:2.3.2.27"));

        const trs = wrapper.findAll("tbody tr");
        expect(trs.at(0).html().includes("EC:2.3.2.27")).toBeTruthy();
        expect(trs.at(1).html().includes("EC:5.6.2.1")).toBeTruthy();

        expect(wrapper.find(".v-data-footer__pagination").text()).toEqual("1-2 of 2");
    });

    it("displays the correct trust line", async() => {
        const wrapper = mount(SingleEcSummaryCard, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true,
                communicationSource: new DefaultCommunicationSource("http://unipept.ugent.be")
            }
        });

        await wrapper.vm.$nextTick();

        // Wait for the table to be rendered.
        await waitForCondition(() => wrapper.findAll("tr").length > 1);

        expect(wrapper.find(".ec-trust")).toMatchSnapshot();
    });
});
