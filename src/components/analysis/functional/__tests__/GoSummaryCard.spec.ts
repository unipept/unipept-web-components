import Setup from "@/test/Setup";
import Vue from "vue"
import Vuetify from "vuetify"
import { createLocalVue, mount } from "@vue/test-utils";
import { waitForCondition, waitForElement } from "@/test/Utils";
import GoSummaryCard from "@/components/analysis/functional/GoSummaryCard.vue";

Vue.use(Vuetify);

const localVue = createLocalVue();

describe("GoSummaryCard", () => {
    let vuetify;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("shows all loading indicators when it switches to the loading state", async() => {
        const wrapper = mount(GoSummaryCard, {
            localVue,
            vuetify,
            propsData: {
                loading: true
            }
        });

        await waitForElement(wrapper, ".go-waiting");

        // 3 circular progress indicators should be shown (one for each namespace) when the loading state is enabled.
        expect(wrapper.findAll(".v-progress-circular").length).toBe(3);
    });
});
