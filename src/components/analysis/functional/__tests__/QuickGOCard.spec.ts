import { shallowMount, createLocalVue } from '@vue/test-utils'
import QuickGOCard from "./../QuickGOCard.vue";
import Vue from 'vue'
import Vuetify from 'vuetify'
import GoTerm from '@/logic/functional-annotations/GoTerm';
import { GoNameSpace } from '@/logic/functional-annotations/GoNameSpace';

Vue.use(Vuetify);

const localVue = createLocalVue();

describe('QuickGOSummaryCard', () => {
    let vuetify;
    let el;

    beforeEach(() => {
        el = document.createElement('div');
        el.setAttribute('data-app', 'true');
        document.body.appendChild(el);
        vuetify = new Vuetify();
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

        wrapper.setData({showModal: true});

        expect(wrapper.find("v-card-text-stub").html()).toMatchSnapshot();
    });

    // it('renders valid GO-terms correctly', () => {
    //     let goTerms: GoTerm[] = [];
    //     goTerms.push(new GoTerm("GO:0006412", "translation", GoNameSpace.BiologicalProcess, 157, 0.13, []));
    //     goTerms.push(new GoTerm("GO:0043312", "neutrophil degranulation", GoNameSpace.BiologicalProcess, 100, 0.09, []));
    //     goTerms.push(new GoTerm("GO:0042026", "protein refolding", GoNameSpace.BiologicalProcess, 73, 0.06, []));

    //     const wrapper = shallowMount(QuickGOCard, {
    //         localVue,
    //         vuetify,
    //         propsData: {
    //             items: goTerms,
    //             sortSettings: null
    //         }
    //     });

    //     expect(wrapper.find("v-card-text-stub")).toMatchSnapshot();
    // });
})
