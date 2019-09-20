import {TaxaPeptideProcessor} from '@/logic/processors/peptide/taxa/TaxaPeptideProcessor';
import PeptideContainer from '@/logic/data-management/PeptideContainer';

test('test TaxaPeptideProcessor (1)', done => {
    var processor: TaxaPeptideProcessor = new TaxaPeptideProcessor();
    processor.process(new PeptideContainer()).then(result => {
        done();
    });
});
  