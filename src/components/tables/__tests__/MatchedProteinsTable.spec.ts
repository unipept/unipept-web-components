import Setup from "@/test/Setup";
import Vue from "vue"
import Vuetify from "vuetify"
import { createLocalVue, mount } from "@vue/test-utils";
import { waitForElement } from "@/test/Utils";
import MatchedProteinsTable from "@/components/tables/MatchedProteinsTable.vue";

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("MatchedProteinsTable", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("displays all required information about functional annotations ", async() => {
        const wrapper = mount(MatchedProteinsTable, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AVGFGGDFDGVPR",
                equateIl: true
            },
            sync: false
        });

        await waitForElement(wrapper, ".v-data-table__expand-icon");
        wrapper.find(".v-data-table__expand-icon").trigger("click");

        await waitForElement(wrapper, ".ec-list.group");
        const ecHtml = wrapper.find(".ec-list-group").html();

        // code should be present
        expect(ecHtml).toContain("3.4.13.19");
        // name should be present
        expect(ecHtml).toContain("Membrane dipeptidase");
        // namespace should be present
        expect(ecHtml).toContain("hydrolases");

        // computed match should be correct
        let matchText = cleanMatchText(wrapper.find(".ec-list-group"));
        expect(matchText).toContain("Assigned to 1 of 1 matched proteins with an EC annotation (100%).");

        await waitForElement(wrapper, ".go-list-group .v-list-item");
        // Look for the component that contains the desired go-number
        const firstGoElement = wrapper.findAll(".go-list-group .v-list-item").filter(c => c.html().includes("GO:0031225")).at(0);
        const goHtml = firstGoElement.html();

        expect(goHtml).toContain("GO:0031225");
        expect(goHtml).toContain("anchored component of membrane");
        expect(goHtml).toContain("cellular component");

        matchText = cleanMatchText(firstGoElement);
        expect(matchText).toContain("Assigned to 1 of 1 matched proteins with a GO annotation (100%).");

        expect(wrapper.findAll(".go-list-group .v-list-item").length).toEqual(28);

        await waitForElement(wrapper, ".interpro-list-group .v-list-item");
        const firstInterproElement = wrapper.findAll(".interpro-list-group .v-list-item").filter(c => c.html().includes("IPR000180")).at(0);
        const interproHtml = firstInterproElement.html();

        expect(interproHtml).toContain("IPR000180");
        expect(interproHtml).toContain("Membrane dipeptidase, active site");
        expect(interproHtml).toContain("active site")

        matchText = cleanMatchText(firstInterproElement);
        expect(matchText).toContain("Assigned to 1 of 1 matched proteins with an InterPro annotation (100%).");
    });

    it("correctly displays an error when no pept2data results are returned", async() => {
        const wrapper = mount(MatchedProteinsTable, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true
            },
            sync: false
        });

        await waitForElement(wrapper, ".v-data-table__expand-icon");
        wrapper.find(".v-data-table__expand-icon").trigger("click");

        await waitForElement(wrapper, ".v-alert");
        expect(wrapper.find(".v-alert").html()).toContain("No data associated with the requested peptide was found!");
    });
});

function cleanMatchText(wrapper): string {
    return wrapper.find(".v-list-item__subtitle")
        .text()
        .replace(/\s+/g, " ");
}
