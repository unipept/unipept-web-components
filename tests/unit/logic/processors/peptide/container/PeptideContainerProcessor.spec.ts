import {PeptideContainerProcessor} from '@/logic/processors/peptide/container/PeptideContainerProcessor';
import {mockFetch, setupPeptideContainer, peptideContainer} from '../common';
import MPAConfig from '@/logic/data-management/MPAConfig';

beforeEach(() => {
    setupPeptideContainer()
    mockFetch()
})

test('test PeptideContainerProcessor (1)', done => {
    var processor = new PeptideContainerProcessor();
    var mpaConfig: MPAConfig = {il: true, dupes: false, missed: false};

    processor.process(peptideContainer, mpaConfig).then(result => {
        console.log(result);
        done();
    });
});
