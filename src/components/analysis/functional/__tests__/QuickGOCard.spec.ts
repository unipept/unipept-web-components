import jest from "jest";
import { shallowMount, createLocalVue } from '@vue/test-utils'
import QuickGOCard from "./../QuickGOCard.vue";
import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify);

const localVue = createLocalVue();

describe('QuickGOSummaryCard', () => {
    let vuetify;

    beforeEach(() => {
      vuetify = new Vuetify()
    })

    it('renders a placeholder when no GO-terms are found', () => {

        const wrapper = shallowMount(QuickGOCard, {
            localVue,
            vuetify,
            propsData: {
                items: [],
                sortSettings: null
            }
        });

        expect(wrapper.html()).toContain('No GO terms for this domain were found.')
    });
})
