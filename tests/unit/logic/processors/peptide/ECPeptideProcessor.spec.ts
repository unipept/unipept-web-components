import {PeptideContainerProcessor} from '@/logic/processors/peptide/container/PeptideContainerProcessor';
import {ECPeptideProcessor} from '@/logic/processors/peptide';
import {mockFetch, setupPeptideContainer, peptideContainer} from './common';
import MPAConfig from '@/logic/data-management/MPAConfig';

beforeEach(() => {
    setupPeptideContainer()
    mockFetch()
})

test('test ECPeptideProcessor (1)', (done) => {
    var peptideContainerProcessor = new PeptideContainerProcessor();
    var ecPeptideProcessor = new ECPeptideProcessor();
    var mpaConfig: MPAConfig = {il: true, dupes: false, missed: false};

    peptideContainerProcessor.process(peptideContainer, mpaConfig)
        .then(result => {
            let countTable = ecPeptideProcessor.process(result);
            console.log(countTable);
            done();
        });
});
