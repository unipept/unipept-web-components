import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import MissingPeptidesList from "./../MissingPeptidesList.vue";
import Vue from "vue";
import Vuetify from "vuetify";
import Vuex from "vuex";
import Mock from "@/test/Mock";
import DataRepository from "@/logic/data-source/DataRepository";
import Assay from "@/logic/data-management/assay/Assay";

Vue.use(Vuetify);
Vue.use(Vuex);

const localVue = createLocalVue();

describe("MissingPeptidesList", () => {
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

    it("correctly renders all peptides ", (done) => {
        let mock: Mock = new Mock();
        mock.mockInitializedAssay().then((assay: Assay) => {
            console.log(assay.dataRepository);

            const wrapper = mount(MissingPeptidesList, {
                store,
                localVue,
                vuetify,
                propsData: {
                    dataset: assay 
                }
            });
    
            // Wait for all async operations to be finished, before expecting anything.
            const flushPromises = () => new Promise(setImmediate);
            flushPromises().then(() => {
                expect(wrapper.html()).toMatchSnapshot();
                // Call done here in the promise resolve.
                done();
            })
        });
    })
})
