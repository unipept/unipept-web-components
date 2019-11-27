import nock from "nock";
import pept2data from "./resources/pept2data.json";
import taxa1 from "./resources/taxa1.json";
import taxa2 from "./resources/taxa2.json";
import goterms1 from "./resources/goterms1.json";
import goterms2 from "./resources/goterms2.json";
import ecnumbers from "./resources/ecnumbers.json";
import LocalStorageMock from "./LocalStorageMock";
const fetchPolifill = require("whatwg-fetch")

export default class Setup {
    public setupAll() {
        this.setUpLocalStorage();
        this.setUpFetch();
        this.setupNock();
    }

    public setUpLocalStorage() {
        globalThis.localStorage = new LocalStorageMock();
    }

    public setUpFetch() {
        globalThis.fetch = fetchPolifill.fetch;
    }

    public setupNock() {
        const pept2dataScope = nock("http://unipept.ugent.be")
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/mpa/pept2data", {
                "peptides": [
                    "YVVLQPGVK",
                    "SGLAPFYSDK",
                    "FLGFEQLFK",
                    "LVLVNAVYFR",
                    "FATSDLNDLYR",
                    "AAANESFGYNEDELVSSDLVGMR",
                    "LGENNAELNALAK",
                    "LAEEVLR",
                    "YEVGTMLELPR",
                    "GMFSMMNYYLPLK",
                    "TNTLLQSAFFK",
                    "ANFEGECSEVGMYLAMAR",
                    "MEVAVGDK",
                    "VLYSK",
                    "QLLVPLLPSLVDR",
                    "ELASLHGTK",
                    "LQTNGAVPDVLQQGR",
                    "SFALNFK",
                    "GTVDEFSGAELVDK",
                    "AAGGLALLGTER",
                    "LLDQGEAGDNVGLLLR",
                    "LLDLGVLVGSGYHVNPK",
                    "VYFLNFKPESSDEWK",
                    "LGLVAVSR",
                    "AVGFGGDFDGVPR"
                ],
                "equate_il": true,
                "missed": false
            })
            .reply(200, pept2data);
    
        const taxa1Scope = nock("http://unipept.ugent.be")
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/private_api/taxa", {
                "taxids": [
                    976,
                    9606,
                    9606,
                    1,
                    1,
                    186802,
                    9606,
                    9606,
                    2,
                    9606,
                    9604,
                    9606,
                    9606,
                    1,
                    816
                ]
            })
            .reply(200, taxa1);
    
        const taxa2Scope = nock("http://unipept.ugent.be")
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/private_api/taxa", {
                "taxids": [
                    2759,
                    33208,
                    7711,
                    89593,
                    8287,
                    40674,
                    314146,
                    9443,
                    376913,
                    314293,
                    9526,
                    314295,
                    207598,
                    9605,
                    1239,
                    186801,
                    200643,
                    171549,
                    815
                ]
            })
            .reply(200, taxa2);
        
        const goterms1Scope = nock("http://unipept.ugent.be")
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/private_api/goterms", {
                "goterms": [
                    "GO:0006605",
                    "GO:0005737",
                    "GO:0005524",
                    "GO:0046872",
                    "GO:0017038",
                    "GO:0005886",
                    "GO:0005887",
                    "GO:0015462",
                    "GO:0043952",
                    "GO:0031522",
                    "GO:0065002",
                    "GO:0005829",
                    "GO:0071277",
                    "GO:0006691",
                    "GO:0030336",
                    "GO:0043154",
                    "GO:0034235",
                    "GO:0016999",
                    "GO:0070062",
                    "GO:0006749",
                    "GO:0031225",
                    "GO:0071732",
                    "GO:0035690",
                    "GO:0072341",
                    "GO:0072340",
                    "GO:0045177",
                    "GO:0030054",
                    "GO:0070573",
                    "GO:0006805",
                    "GO:0005634",
                    "GO:0005615",
                    "GO:0016324",
                    "GO:0050667",
                    "GO:0031528",
                    "GO:0008235",
                    "GO:0008239",
                    "GO:0008270",
                    "GO:0043027",
                    "GO:0043066",
                    "GO:0004180",
                    "GO:0004181",
                    "GO:0006508",
                    "GO:0016020",
                    "GO:0046677",
                    "GO:0003677",
                    "GO:0009842",
                    "GO:0000287",
                    "GO:0070111",
                    "GO:0009507",
                    "GO:0009536",
                    "GO:0006351",
                    "GO:0005618",
                    "GO:0003899",
                    "GO:0036267",
                    "GO:0006520",
                    "GO:0006537",
                    "GO:0097308",
                    "GO:0005739",
                    "GO:0019676",
                    "GO:0097054",
                    "GO:0005576",
                    "GO:0004354",
                    "GO:0004612",
                    "GO:0006094",
                    "GO:0004177",
                    "GO:0070006",
                    "GO:0006414",
                    "GO:0003924",
                    "GO:0005525",
                    "GO:0003746",
                    "GO:0036457",
                    "GO:0070268",
                    "GO:0017171",
                    "GO:0004252",
                    "GO:0004867",
                    "GO:0062023",
                    "GO:0002020",
                    "GO:0071470",
                    "GO:0101003",
                    "GO:0097180",
                    "GO:0043312",
                    "GO:0007605",
                    "GO:0070821",
                    "GO:0010951",
                    "GO:0030667",
                    "GO:0006670",
                    "GO:0006672",
                    "GO:0017040",
                    "GO:0005901",
                    "GO:0046512",
                    "GO:0046513",
                    "GO:0046514",
                    "GO:0005794",
                    "GO:0042759",
                    "GO:0102121",
                    "GO:0071345",
                    "GO:0000139",
                    "GO:0005509",
                    "GO:2001234",
                    "GO:0007346"
                ]
            })
            .reply(200, goterms1);
        
        const goterms2Scope = nock("http://unipept.ugent.be")
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/private_api/goterms", {
                "goterms": [
                    "GO:0044241",
                    "GO:0006915",
                    "GO:0030246",
                    "GO:0007155",
                    "GO:0016936",
                    "GO:0016887",
                    "GO:0050769",
                    "GO:0006633",
                    "GO:0016032",
                    "GO:0016021",
                    "GO:0032039",
                    "GO:0046685",
                    "GO:0035257",
                    "GO:0003684",
                    "GO:0006744",
                    "GO:0007221",
                    "GO:0009883",
                    "GO:0007219",
                    "GO:0008534",
                    "GO:0016094",
                    "GO:0007189",
                    "GO:0007166",
                    "GO:0004948",
                    "GO:0015633",
                    "GO:0004659",
                    "GO:0004672",
                    "GO:0005112",
                    "GO:0006457",
                    "GO:0042974",
                    "GO:0017148",
                    "GO:0005085",
                    "GO:0005089",
                    "GO:0008137",
                    "GO:0030036",
                    "GO:0016604",
                    "GO:0016607",
                    "GO:0050681",
                    "GO:0035023",
                    "GO:0000398",
                    "GO:0048385",
                    "GO:0048384",
                    "GO:0016740",
                    "GO:0031516",
                    "GO:0009630",
                    "GO:0035914",
                    "GO:0009640",
                    "GO:0009638",
                    "GO:0019899",
                    "GO:0051087",
                    "GO:0009584",
                    "GO:0051085",
                    "GO:0051082",
                    "GO:0045261",
                    "GO:0008299",
                    "GO:0048026",
                    "GO:0048038",
                    "GO:0042771",
                    "GO:0042773",
                    "GO:0042777",
                    "GO:0004497",
                    "GO:0008897",
                    "GO:0045762",
                    "GO:0010218",
                    "GO:0045747",
                    "GO:0010203",
                    "GO:0010201",
                    "GO:0035556",
                    "GO:0042802",
                    "GO:0042803",
                    "GO:0042809",
                    "GO:0045944",
                    "GO:0006367",
                    "GO:0017006",
                    "GO:0006355",
                    "GO:0006357",
                    "GO:0006284",
                    "GO:0006289",
                    "GO:0045892",
                    "GO:0018298",
                    "GO:0071300",
                    "GO:0000155",
                    "GO:0000122",
                    "GO:0046332",
                    "GO:0071013",
                    "GO:0071007",
                    "GO:0006874",
                    "GO:0030511",
                    "GO:0016180",
                    "GO:0003723",
                    "GO:0070562",
                    "GO:0003729",
                    "GO:0070564",
                    "GO:0003713",
                    "GO:0003714",
                    "GO:0043923",
                    "GO:0071141",
                    "GO:0005681",
                    "GO:0005654",
                    "GO:0006979",
                    "GO:0140078"
                ]
            })
            .reply(200, goterms2);
    
        const ecnumbersScope = nock("http://unipept.ugent.be")
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/private_api/ecnumbers", {
                "ecnumbers": [
                    "3.4.13.19",
                    "3.4.13.-",
                    "3.4.-.-",
                    "3.-.-.-",
                    "3.4.17.2",
                    "3.4.17.-",
                    "2.7.7.6",
                    "2.7.7.-",
                    "2.7.-.-",
                    "2.-.-.-",
                    "1.4.1.4",
                    "1.4.1.-",
                    "1.4.-.-",
                    "1.-.-.-",
                    "4.1.1.49",
                    "4.1.1.-",
                    "4.1.-.-",
                    "4.-.-.-",
                    "3.4.11.9",
                    "3.4.11.-",
                    "3.4.21.71",
                    "3.4.21.-",
                    "3.5.1.23",
                    "3.5.1.-",
                    "3.5.-.-",
                    "3.2.2.23",
                    "3.2.2.-",
                    "3.2.-.-",
                    "2.5.1.90",
                    "2.5.1.-",
                    "2.5.-.-",
                    "2.7.8.7",
                    "2.7.8.-",
                    "3.6.3.-",
                    "3.6.-.-",
                    "4.2.99.18",
                    "4.2.99.-",
                    "4.2.-.-",
                    "7.1.1.-",
                    "7.1.-.-",
                    "7.-.-.-"
                ]
            })
            .reply(200, ecnumbers);
    }
}