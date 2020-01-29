import { shallowMount, mount, createLocalVue } from "@vue/test-utils"
import Vue from "vue"
import Vuetify from "vuetify"
import Mock from "../../../test/Mock"
import DataRepository from "../../../logic/data-source/DataRepository";
import HierarchicalOutlineVisualization from "./../HierarchicalOutlineVisualization.vue";
import "jsdom-worker-fix";
import Vuex from "vuex";
import flushPromises from "flush-promises"
import { waitForElement } from "@/test/Utils";

Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

describe("HierarchicalOutlineVisualization", () => {
    let vuetify;
    let getters;
    let store;

    beforeEach(() => {
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
    });

    it("renders simple datasets", async(done) => {
        const mock: Mock = new Mock();
        const dataRepository: DataRepository = await mock.mockDataRepository();
        const wrapper = mount(HierarchicalOutlineVisualization, {
            store,
            localVue,
            vuetify,
            propsData: {
                dataRepository: dataRepository
            }
        });

        // Wait for all async operations to be finished, before expecting anything.
        await waitForElement(wrapper, ".collapsibleListOpen");
        expect(wrapper.html()).toMatchSnapshot();
        // Call done here in the promise resolve.
        done();
    });

    // it("updates accordingly to the selected term", (done) => {
    //     let mock: Mock = new Mock();
    //     mock.mockDataRepository().then((dataRepository: DataRepository) => {
    //         const wrapper = shallowMount(HierarchicalOutlineVisualization, {
    //             store,
    //             localVue,
    //             vuetify,
    //             propsData: {
    //                 dataRepository: dataRepository
    //             }
    //         });
    
    //         // getters.selectedTerm = () => "Bacteria";

    //         // Wait for all async operations to be finished, before expecting anything.
    //         // wrapper.vm.$nextTick(() => {
    //         //     // console.log(wrapper.html());
    //         //     // expect(wrapper.html()).toContain("Bacteria");
    //         //     done();
    //         // });
    //         // const flushPromises = () => new Promise(setImmediate);
    //         // flushPromises().then(() => {
    //         //     expect(wrapper.html()).toContain("Bacteria");
    //         //     done();
    //         // })

    //         done();
    //     });
    // });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
