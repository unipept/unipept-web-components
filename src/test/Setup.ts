import nock from "nock";
import pridedata from "./resources/pridedata.json";
import LocalStorageMock from "./LocalStorageMock";
import ClipboardMock from "./ClipboardMock";
import NetworkConfiguration from "@/business/communication/NetworkConfiguration";
import UnipeptApiDataSource from "@/test/api/UnipeptApiDataSource";
const fetchPolyfill = require("whatwg-fetch")

export default class Setup {
    public setupAll() {
        this.setupLocalStorage();
        this.setupFetch();
        this.setupUnipeptNock();
        this.setUpPrideNock();
        this.setupClipboard();
    }

    public setupLocalStorage() {
        globalThis.localStorage = new LocalStorageMock();
    }

    public setupFetch() {
        globalThis.fetch = fetchPolyfill.fetch;
    }

    public setupClipboard() {
        // Required to override the clipboard property of the navigator
        type Writable<T> = { -readonly [P in keyof T]: T[P] };
        let writableNavigator: Writable<Navigator> = navigator;
        writableNavigator.clipboard = new ClipboardMock();
    }

    /**
     * Intercepts calls to the PRIDE-API and makes sure that deterministic results are returned. Only calls required to
     * retrieve assay 2600 are intercepted.
     */
    public setUpPrideNock() {
        nock("https://www.ebi.ac.uk")
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .get("/pride/ws/archive/peptide/count/assay/2600")
            .reply(200, "588");

        nock("https://www.ebi.ac.uk")
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .get("/pride/ws/archive/peptide/list/assay/2600?show=1000&page=0")
            .reply(200, pridedata);
    }

    /**
     * Set up interceptors for Unipept API-calls that are performed when analysing the realistic assay, given by the
     * mockRealisticAssay-function in the Mock-class.
     */
    public setupUnipeptNock() {
        const baseUrl: string = "http://unipept.ugent.be";
        NetworkConfiguration.BASE_URL = baseUrl;

        const dataSource = new UnipeptApiDataSource();

        nock(baseUrl)
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/datasets/sampledata")
            .reply(200, dataSource.getSampleData());

        nock(baseUrl)
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/mpa/pept2data",() => true)
            .reply((uri, body) => {
                return [200, {
                    peptides: dataSource.getPept2DataResponse(body["peptides"])
                }]
            });

        nock(baseUrl)
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/private_api/taxa", () => true)
            .reply((uri, body) => {
                return [200, dataSource.getTaxa(body["taxids"])];
            });

        nock(baseUrl)
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/private_api/goterms", () => true)
            .reply((uri, body) => {
                return [200, dataSource.getGoTermsResponse(body["goterms"])];
            });

        nock(baseUrl)
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/private_api/ecnumbers", () => true)
            .reply((uri, body) => {
                return [200, dataSource.getEcNumbersResponse(body["ecnumbers"])];
            });

        nock(baseUrl)
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/private_api/interpros", () => true)
            .reply((uri, body) => {
                return [200, dataSource.getInterproEntriesResponse(body["interpros"])];
            });
    }
}
