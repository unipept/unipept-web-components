import jest from "jest";
import { shallowMount } from '@vue/test-utils'
import QuickGOCard from "./../QuickGOCard.vue";

describe('QuickGOSummaryCard', () => {
    it('renders a placeholder when no GO-terms are found', () => {
        const wrapper = shallowMount(QuickGOCard, {
            propsData: {
                items: [],
                sortSettings: null
            }
        });

        expect(wrapper.html()).toContain('No GO terms for this domain were found.')
    });
})
