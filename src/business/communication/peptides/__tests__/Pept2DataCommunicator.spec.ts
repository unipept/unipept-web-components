import nock, { Scope } from "nock";

import AAAAA from "./responses/AAAAA.json";
import AALTER from "./responses/AALTER.json";
import FATSDLNDLYR from "./responses/FATSDLNDLYR.json";

import Pept2DataCommunicator from "@/business/communication/peptides/Pept2DataCommunicator";
import { Peptide } from "@/business/ontology/raw/Peptide";
import { CountTable } from "@/business/counts/CountTable";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import Setup from "@/test/Setup";
import NetworkConfiguration from "@/business/communication/NetworkConfiguration";
import { ShareableMap } from "shared-memory-datastructures";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";
import PeptideData from "@/business/communication/peptides/PeptideData";

const counts = new Map([
    ["AAAAA", 1],
    ["AALTER", 1],
    ["YVVIQPGVK", 1],
    ["FATSDLNDLYR", 1],
    ["ELASLHGTK", 1]
]);

const searchConfig = new SearchConfiguration();

describe("Pept2DataCommunicator", () => {
    beforeEach(() => {
        const setup = new Setup();
        setup.setupFetch();
        setup.setupTextCoders();
        NetworkConfiguration.BASE_URL = "http://unipept.ugent.be";

        // Reset Pept2DataCommunicator state
        Pept2DataCommunicator["configurationToResponses"] = new Map<string, ShareableMap<string, PeptideData>>();
        Pept2DataCommunicator["configurationToProcessed"] = new Map<string, Set<Peptide>>();
    })

    it("correctly computes the PeptideTrust for a list of peptides", async(done) => {
        const peptideCountTable = new CountTable<Peptide>(counts)

        // This request should be performed by the communicator. We answer by returning data for only 3 of the 5 given
        // peptides. This means that the peptide trust should be 3 matched, 2 missed peptides.
        setupNock(Array.from(counts.keys()), JSON.stringify({
            peptides: [AAAAA, AALTER, FATSDLNDLYR]
        }));

        const communicationSource = new DefaultCommunicationSource();
        const pept2DataCommunicator = communicationSource.getPept2DataCommunicator();

        await pept2DataCommunicator.process(peptideCountTable, searchConfig);
        const trust = await pept2DataCommunicator.getPeptideTrust(peptideCountTable, searchConfig);

        expect(trust.missedPeptides).toEqual(["YVVIQPGVK", "ELASLHGTK"]);
        expect(trust.matchedPeptides).toBe(3);
        expect(trust.searchedPeptides).toBe(5);

        done();
    });

    it("correctly parses a response from the API", async(done) => {
        const peptideCountTable = new CountTable<Peptide>(counts);

        setupNock(Array.from(counts.keys()), JSON.stringify({
            peptides: [AAAAA, AALTER, FATSDLNDLYR]
        }));

        const communicationSource = new DefaultCommunicationSource();
        const pept2DataCommunicator = communicationSource.getPept2DataCommunicator();

        await pept2DataCommunicator.process(peptideCountTable, searchConfig);
        const response = pept2DataCommunicator.getPeptideResponse("AAAAA", searchConfig).toPeptideDataResponse();
        response["sequence"] = "AAAAA";

        expect(response).toEqual(AAAAA);

        done();
    });

    /**
     * This test checks that no peptide is requested more than once from the Unipept API.
     *
     * By setting up Nock-interceptors and checking that these are only triggered once, we can be sure that previous
     * requests to the communicator are cached.
     */
    it("correctly caches previous peptides", async(done) => {
        const smallCounts = new Map([
            ["AAAAA", 1],
            ["AALTER", 1],
            ["YVVIQPGVK", 1]
        ]);

        const smallCountTable = new CountTable<Peptide>(smallCounts);

        setupNock(Array.from(smallCounts.keys()), JSON.stringify({
            peptides: [AAAAA, AALTER]
        }));

        const communicationSource = new DefaultCommunicationSource();
        const pept2DataCommunicator = communicationSource.getPept2DataCommunicator();

        // First we call the communicator with a small set of peptides and let him process them.
        await pept2DataCommunicator.process(smallCountTable, searchConfig);

        // Now, we construct a larger count table in which the peptides from the smaller set also occur. We expect the
        // communicator to only request the peptides that haven't been processed before. We do this by setting up a
        // Nock-interceptor that only reacts to the subset of peptides that haven't been processed before.
        let interceptorCalled = false;

        nock("http://unipept.ugent.be")
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .post("/mpa/pept2data", {
                "peptides": ["FATSDLNDLYR", "ELASLHGTK"],
                "equate_il": true,
                "missed": false
            })
            .reply((uri, requestBody) => {
                interceptorCalled = true;
                return [200, {
                    peptides: [FATSDLNDLYR]
                }]
            });

        const largeCountTable = new CountTable<Peptide>(counts);
        await pept2DataCommunicator.process(largeCountTable, searchConfig);

        expect(interceptorCalled).toBeTruthy();
        done();
    });

    /**
     * This test checks if responses are only returned for the search configuration for which they were requested. The
     * API returns a different result for different search settings, and thus the returned results need to be cached per
     * search configuration.
     */
    it("correctly identifies search configurations", async(done) => {
        const countTable = new CountTable<Peptide>(counts);

        setupNock(Array.from(counts.keys()), JSON.stringify({
            peptides: [AAAAA, AALTER, FATSDLNDLYR]
        }));

        // Only the missing cleavage handling is considered when caching the results, since this is the only parameter
        // that's passed on to the server.
        const searchConfig1 = new SearchConfiguration(true, true, false);
        const searchConfig2 = new SearchConfiguration(true, true, true);

        const communicationSource = new DefaultCommunicationSource();
        const pept2DataCommunicator = communicationSource.getPept2DataCommunicator();

        await pept2DataCommunicator.process(countTable, searchConfig1);

        expect(pept2DataCommunicator.getPeptideResponse("AAAAA", searchConfig1)).toBeTruthy();
        expect(pept2DataCommunicator.getPeptideResponse("AAAAA", searchConfig2)).toBeFalsy();

        // Also make sure that 2 different objects that represent the same search config are considered to be the same.
        const searchConfig3 = new SearchConfiguration(true, true, false);
        expect(pept2DataCommunicator.getPeptideResponse("AAAAA", searchConfig3)).toBeTruthy();

        done();
    });
});

function setupNock(peptides: Peptide[], reply: string): Scope {
    return nock("http://unipept.ugent.be")
        .defaultReplyHeaders({ "access-control-allow-origin": "*" })
        .post("/mpa/pept2data", {
            "peptides": peptides,
            "equate_il": true,
            "missed": false
        })
        .reply(200, reply);
}
