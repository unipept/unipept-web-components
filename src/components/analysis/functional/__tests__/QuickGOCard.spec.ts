import { shallowMount, createLocalVue } from "@vue/test-utils"
import QuickGOCard from "./../QuickGOCard.vue";
import Vue from "vue"
import Vuetify from "vuetify"
import GOAnnotation from "src/logic/functional-annotations/GOAnnotation";
import { GoNameSpace } from "../../../../logic/functional-annotations/GoNameSpace";
import FaSortSettings from "../../../tables/FaSortSettings";
import GODefinition from "@/logic/data-management/ontology/go/GODefinition";

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("QuickGOSummaryCard", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    it("renders a placeholder when no GO-terms are found", () => {
        const wrapper = shallowMount(QuickGOCard, {
            localVue,
            vuetify,
            propsData: {
                items: [],
                sortSettings: null
            }
        });

        wrapper.setData({ showModal: true });

        expect(wrapper.find("v-card-text-stub").html()).toMatchSnapshot();
    });

    it("renders valid GO-terms correctly", () => {
        let goTerms: GOAnnotation[] = [];
        goTerms.push(new GOAnnotation(
            new GODefinition("GO:0006412", "translation", GoNameSpace.BiologicalProcess),
            157,
            0.13,
            []
        ));
        goTerms.push(new GOAnnotation(
            new GODefinition("GO:0043312", "neutrophil degranulation", GoNameSpace.BiologicalProcess),
            100,
            0.09,
            []
        ));
        goTerms.push(new GOAnnotation(
            new GODefinition("GO:0042026", "protein refolding", GoNameSpace.BiologicalProcess),
            73,
            0.06,
            []
        ));

        let sortSettings: FaSortSettings = new FaSortSettings(
            (x: GOAnnotation) => x.toString(),
            "popularity",
            "fractionOfPepts",
            "Peptides",
            (a, b) => b["popularity"] - a["popularity"]
        );

        const wrapper = shallowMount(QuickGOCard, {
            localVue,
            vuetify,
            propsData: {
                items: goTerms,
                sortSettings: sortSettings
            }
        });

        expect(wrapper.find("v-card-text-stub").html()).toMatchSnapshot();
    });
})
