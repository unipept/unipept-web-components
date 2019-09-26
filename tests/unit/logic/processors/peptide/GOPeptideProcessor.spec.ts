import {PeptideContainerProcessor} from '@/logic/processors/peptide/container/PeptideContainerProcessor';
import {GOPeptideProcessor} from '@/logic/processors/peptide';
import {mockFetch, setupPeptideContainer, peptideContainer} from './common';
import MPAConfig from '@/logic/data-management/MPAConfig';

beforeEach(() => {
    setupPeptideContainer()
    mockFetch()
})

test('test GOPeptideProcessor (1)', (done) => {
    var peptideContainerProcessor = new PeptideContainerProcessor();
    var goPeptideProcessor = new GOPeptideProcessor();
    var mpaConfig: MPAConfig = {il: true, dupes: false, missed: false};

    peptideContainerProcessor.process(peptideContainer, mpaConfig)
        .then(result => {
            let countTable = goPeptideProcessor.process(result);
            console.log(countTable);
            done();
        });
});
