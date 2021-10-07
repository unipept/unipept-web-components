import Vue from "vue"
import Vuetify from "vuetify"
import { createLocalVue, mount } from "@vue/test-utils";
import Setup from "@/test/Setup";
import { waitForCondition } from "@/test/Utils";
import SingleGoSummaryCard from "@/components/analysis/single/SingleGoSummaryCard.vue";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("SingleGoSummaryCard", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("correctly displays the correct GO-terms for a given peptide", async() => {
        const wrapper = mount(SingleGoSummaryCard, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true,
                communicationSource: new DefaultCommunicationSource("http://unipept.ugent.be")
            }
        });

        await waitForCondition(() => wrapper.findAll("tr").length > 1);

        const sortButtons = wrapper.findAll("th").filter(w => w.html().includes("GO term"));
        // Filter each of the 3 tables by GO-term code.
        sortButtons.wrappers.map(w => w.trigger("click"));

        // This should include 3 containers. The first one for biological process, the second one for cellular
        // component and the last one for molecular function.
        const goContainers = wrapper.findAll(".go-table-container");

        // Make sure each of these containers has been sorted correctly before continuing
        await waitForCondition(() => goContainers.at(0).find("tbody tr").html().includes("GO:0000746"));
        await waitForCondition(() => goContainers.at(1).find("tbody tr").html().includes("GO:0005634"));
        await waitForCondition(() => goContainers.at(2).find("tbody tr").html().includes("GO:0000287"));

        // Now check for each of the tables if it contains the expected GO-terms.
        let trs = goContainers.at(0).findAll("tbody tr");
        expect(trs.at(0).html().includes("GO:0000746")).toBeTruthy();
        expect(trs.at(1).html().includes("GO:0008152")).toBeTruthy();
        expect(trs.at(2).html().includes("GO:0016567")).toBeTruthy();

        expect(goContainers.at(0).find(".v-data-footer__pagination").text()).toEqual("1-3 of 3");

        // Tests for cellular component
        trs = goContainers.at(1).findAll("tbody tr");
        expect(trs.at(0).html().includes("GO:0005634")).toBeTruthy();
        expect(trs.at(1).html().includes("GO:0005737")).toBeTruthy();
        expect(trs.at(2).html().includes("GO:0005829")).toBeTruthy();

        expect(goContainers.at(1).find(".v-data-footer__pagination").text()).toEqual("1-3 of 3");

        // Tests for molecular function
        trs = goContainers.at(2).findAll("tbody tr");
        expect(trs.at(0).html().includes("GO:0000287")).toBeTruthy();
        expect(trs.at(1).html().includes("GO:0003677")).toBeTruthy();
        expect(trs.at(2).html().includes("GO:0003678")).toBeTruthy();

        expect(goContainers.at(2).find(".v-data-footer__pagination").text()).toEqual("1-5 of 10");
    });

    it("displays the correct trust line", async() => {
        const wrapper = mount(SingleGoSummaryCard, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true,
                communicationSource: new DefaultCommunicationSource("http://unipept.ugent.be")
            }
        });

        // Wait for the table to be rendered.
        await waitForCondition(() => wrapper.find(".go-trust").html().includes("protein"));

        expect(wrapper.find(".go-trust").html()).toMatchSnapshot();
    });
});
