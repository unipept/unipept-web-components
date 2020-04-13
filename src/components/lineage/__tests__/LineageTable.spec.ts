import Setup from "@/test/Setup";
import Vue from "vue"
import Vuetify from "vuetify"
import { createLocalVue, mount } from "@vue/test-utils";
import { waitForCondition, waitForElement } from "@/test/Utils";
import LineageTable from "@/components/lineage/LineageTable.vue";
import { NcbiRank } from "@/business/ontology/taxonomic/ncbi/NcbiRank";

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("LineageTable", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("correctly renders information about each taxon associated with the given peptide", async() => {
        const wrapper = mount(LineageTable, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true
            },
            sync: false
        });

        // Wait for the complete table to be rendered.
        await waitForCondition(() => wrapper.findAll("table tr").length === 9);

        // There are 8 organisms associated with the given peptide and one td extra inserted by Vuetify,
        // so we expect 9 rows in our table
        expect(wrapper.findAll("table tr").length).toBe(9);

        const wrapperArabidopsis = wrapper.findAll("table tr").filter(w => w.html().includes("Arabidopsis thaliana")).at(0);
        const arabidopsisHtml = wrapperArabidopsis.html();

        expect(arabidopsisHtml).toContain("Eukaryota");
        expect(arabidopsisHtml).toContain("Viridiplantae");
        expect(arabidopsisHtml).toContain("Streptophyta");
        expect(arabidopsisHtml).toContain("Arabidopsis thaliana");
        expect(arabidopsisHtml).toContain("Magnoliopsida");
        expect(arabidopsisHtml).toContain("Brassicales");
        expect(arabidopsisHtml).toContain("Brassicaceae");
        expect(arabidopsisHtml).toContain("Camelineae");
        expect(arabidopsisHtml).toContain("Arabidopsis");
    });

    it("renders every taxon name that occurs more than once with the same colour", async() => {
        const wrapper = mount(LineageTable, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true
            },
            sync: false
        });

        // Wait for the complete table to be rendered.
        await waitForCondition(() => wrapper.findAll("table tr").length === 9);

        const eukaryotaTds = wrapper.findAll("td").filter(w => w.html().includes("Eukaryota"));
        // There should be 4 cells that correspond to the Eukaryota item
        expect(eukaryotaTds.length).toBe(4);

        // These should all be of the same colour!
        const colourClasses = eukaryotaTds.at(0).classes();
        for (let i = 0; i < colourClasses.length; i++) {
            const w = eukaryotaTds.at(i);
            expect(w.classes()).toEqual(colourClasses);
        }
    });

    it("correctly renders the header row", async() => {
        const wrapper = mount(LineageTable, {
            localVue,
            vuetify,
            propsData: {
                peptide: "AALTER",
                equateIl: true
            },
            sync: false
        });

        // Wait for the complete table to be rendered.
        await waitForCondition(() => wrapper.findAll("table tr").length === 9);

        // The first tr should be the header row
        const headerRow = wrapper.find("table tr");
        for (const rank of Object.values(NcbiRank)) {
            expect(headerRow.html()).toContain(rank);
        }
    });
});
