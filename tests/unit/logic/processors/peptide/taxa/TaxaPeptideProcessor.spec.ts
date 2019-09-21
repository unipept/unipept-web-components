import {TaxaPeptideProcessor} from '@/logic/processors/peptide/taxa/TaxaPeptideProcessor';
import PeptideContainer from '@/logic/data-management/PeptideContainer';
import MPAConfig from '@/logic/data-management/MPAConfig';

test('test TaxaPeptideProcessor (1)', done => {
    var processor: TaxaPeptideProcessor = new TaxaPeptideProcessor();

    var mpaConfig: MPAConfig = {il: true, dupes: false, missed: false};
    var peptideContainer = new PeptideContainer();
    peptideContainer.setPeptides(["ADYPEGDGNWANYNTFGSAEAATSDDYK", "AGDLVEFHK", "AGLEVEPFESVHVYELMCR"]);

    fetchMock.mockResponse(
        JSON.stringify({"peptides":[
            {
                "sequence":"ADYPEGDGNWANYNTFGSAEAATSDDYK",
                "lca":40674,
                "lineage":[2759,33208,null,null,7711,89593,8287,40674,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
                "fa":
                {
                    "counts":{"all":62,"EC":0,"GO":12},
                    "data":{"GO:0030246":2,"GO:0070492":11,"GO:0045121":3,"GO:0009624":3,"GO:0031526":3,"GO:0070207":10,"GO:0042802":10,"GO:0043235":10,"GO:0031225":1,"GO:0046326":10,"GO:0005509":10,"GO:0005576":2,"GO:0046872":1,"GO:0001934":10}
                }
            },
            {
                "sequence":"AGDLVEFHK",
                "lca":40674,
                "lineage":[2759,33208,null,null,7711,89593,8287,40674,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
                "fa":
                {
                    "counts":{"all":10,"EC":1,"GO":9},
                    "data":{"GO:0006684":1,"GO:0006685":9,"GO:0006687":1,"GO:0016020":1,"GO:0008156":5,"GO:0005902":5,"GO:0004767":9,"GO:0008270":5,"GO:0008285":5,"GO:0005794":5,"GO:0005886":1,"GO:0005887":5,"EC:3.1.4.12":1}
                }
            },
            {
                "sequence":"AGLEVEPFESVHVYELMCR",
                "lca":9526,
                "lineage":[2759,33208,null,null,7711,89593,8287,40674,null,null,314146,9443,376913,314293,9526,null,null,null,null,null,null,null,null,null,null,null,null,null],
                "fa":
                {
                    "counts":{"all":18,"EC":1,"GO":17},
                    "data":{"GO:0006684":1,"GO:0006685":17,"GO:0006687":1,"GO:0016020":1,"GO:0008156":7,"GO:0005902":7,"GO:0004767":17,"GO:0008270":7,"GO:0008285":7,"GO:0005794":7,"GO:0005886":1,"GO:0005887":7,"EC:3.1.4.12":1}
                }
            }
        ]})
    )

    processor.process(peptideContainer, mpaConfig).then(result => {
        console.log(result);
        done();
    });
});
  