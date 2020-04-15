import { createLocalVue, shallowMount } from "@vue/test-utils"
import QuickGoCard from "./../QuickGoCard.vue";
import Vue from "vue"
import Vuetify from "vuetify"
import GoDefinition from "@/business/ontology/functional/go/GoDefinition";
import { GoNamespace } from "@/business/ontology/functional/go/GoNamespace";

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("QuickGoCard", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    it("renders a placeholder when no GO-terms are found", () => {
        const wrapper = shallowMount(QuickGoCard, {
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
        let goTerms: GoDefinition[] = [];
        goTerms.push(new GoDefinition(
            "GO:0006412",
            "translation",
            GoNamespace.BiologicalProcess
        ));
        goTerms.push(new GoDefinition(
            "GO:0043312",
            "neutrophil degranulation",
            GoNamespace.BiologicalProcess
        ));
        goTerms.push(new GoDefinition(
            "GO:0042026",
            "protein refolding",
            GoNamespace.BiologicalProcess
        ));

        const wrapper = shallowMount(QuickGoCard, {
            localVue,
            vuetify,
            propsData: {
                items: goTerms,
            }
        });

        expect(wrapper.find("v-card-text-stub").html()).toMatchSnapshot();
    });
})
