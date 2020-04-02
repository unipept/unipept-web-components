import nock from "nock";
import pept2dataReply from "./pept2dataReply.json";
import Pept2DataCommunicator from "@/business/communication/peptides/Pept2DataCommunicator";
import { Peptide } from "@/business/ontology/raw/Peptide";
import { CountTable } from "@/business/counts/CountTable";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import Setup from "@/test/Setup";
import NetworkConfiguration from "@/business/communication/NetworkConfiguration";

describe("Pept2DataCommunicator", () => {
    beforeEach(() => {
        const setup = new Setup();
        setup.setupFetch();
        NetworkConfiguration.BASE_URL = "http://unipept.ugent.be"
    })

    it("correctly computes the PeptideTrust for a list of peptides", async(done) => {
        const counts = new Map([
            ["AAAAA", 1],
            ["AALTER", 1],
            ["YVVIQPGVK", 1],
            ["FATSDLNDLYR", 1],
            ["ELASLHGTK", 1]
        ]);

        const peptideCountTable = new CountTable<Peptide>(counts)

        // This request should be performed by the communicator. We answer by returning data for only 3 of the 5 given
        // peptides. This means that the peptide trust should be 3 matched, 2 missed peptides.
        nock("http://unipept.ugent.be")
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .persist()
            .post("/mpa/pept2data", {
                "peptides": Array.from(counts.keys()),
                "equate_il": true,
                "missed": false
            })
            .reply(200, pept2dataReply);

        const searchConfig = new SearchConfiguration();
        await Pept2DataCommunicator.process(peptideCountTable, searchConfig);
        const trust = await Pept2DataCommunicator.getPeptideTrust(peptideCountTable, searchConfig);

        expect(trust.missedPeptides).toEqual(["YVVIQPGVK", "ELASLHGTK"]);
        expect(trust.matchedPeptides).toBe(3);
        expect(trust.searchedPeptides).toBe(5);

        done();
    })
});
