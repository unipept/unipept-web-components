import {PeptideContainerProcessor} from '@/logic/processors/peptide/container/PeptideContainerProcessor';
import {TaxaPeptideProcessor} from '@/logic/processors/peptide';
import {mockFetch, setupPeptideContainer, peptideContainer} from './common';
import MPAConfig from '@/logic/data-management/MPAConfig';

beforeEach(() => {
    setupPeptideContainer()
    mockFetch()
})

test('test TaxaPeptideProcessor (1)', (done) => {
    var peptideContainerProcessor = new PeptideContainerProcessor();
    var taxaPeptideProcessor = new TaxaPeptideProcessor();
    var mpaConfig: MPAConfig = {il: true, dupes: false, missed: false};

    peptideContainerProcessor.process(peptideContainer, mpaConfig)
        .then(result => {
            let countTable = taxaPeptideProcessor.process(result);
            console.log(countTable);
            done();
        });
});
