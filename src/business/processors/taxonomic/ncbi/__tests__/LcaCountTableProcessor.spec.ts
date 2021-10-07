import { Peptide } from "@/business/ontology/raw/Peptide";
import { CountTable } from "@/business/counts/CountTable";
import LcaCountTableProcessor from "@/business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import Setup from "@/test/Setup";
import flushPromises from "flush-promises";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";
import { Pept2DataCommunicator } from "@/business";

const counts = new Map([
    ["YVVLQPGVK", 1],
    ["SFALNFK", 1],
    ["QLLVPLLPSLVDR", 1],
    ["FLGFEQLFK", 1]
]);

const countTable = new CountTable<Peptide>(counts);

// Some peptides are present more than once in this count table, which should lead to different results!
const multiCounts = new Map([
    ["YVVLQPGVK", 2],
    ["SFALNFK", 1],
    ["QLLVPLLPSLVDR", 1],
    ["FLGFEQLFK", 3]
]);

const multiCountTable = new CountTable<Peptide>(multiCounts);

describe("LcaCountTableProcessor", () => {
    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("correctly computes counts", async(done) => {
        const pept2DataCommunicator = new Pept2DataCommunicator("http://unipept.ugent.be");
        const pept2data = await pept2DataCommunicator.process(countTable, new SearchConfiguration());

        let lcaProcessor = new LcaCountTableProcessor(
            countTable,
            new SearchConfiguration(false, false, false),
            pept2data
        );
        let lcaTable = await lcaProcessor.getCountTable();

        await flushPromises();

        expect(lcaTable.getOntologyIds().sort()).toEqual([1, 816, 9606]);

        expect(lcaTable.getCounts(1)).toBe(1);
        expect(lcaTable.getCounts(816)).toBe(1);
        expect(lcaTable.getCounts(9606)).toBe(2);
        expect(lcaTable.getCounts(2)).toBe(0);

        // Also test whether peptides that occur multiple times are computed correctly
        lcaProcessor = new LcaCountTableProcessor(
            multiCountTable,
            new SearchConfiguration(false, false, false),
            pept2data
        );
        lcaTable = await lcaProcessor.getCountTable();

        expect(lcaTable.getCounts(1)).toBe(3);
        expect(lcaTable.getCounts(816)).toBe(2);
        expect(lcaTable.getCounts(9606)).toBe(2);
        expect(lcaTable.getCounts(2)).toBe(0);

        done();
    });

    it("correctly computes lca -> peptide mapping", async(done) => {
        const pept2DataCommunicator = new Pept2DataCommunicator("http://unipept.ugent.be");
        const pept2data = await pept2DataCommunicator.process(countTable, new SearchConfiguration());

        const lcaProcessor = new LcaCountTableProcessor(
            countTable,
            new SearchConfiguration(false, false, false),
            pept2data
        );
        const mapping = await lcaProcessor.getAnnotationPeptideMapping();

        expect(mapping.get(1)).toEqual(["FLGFEQLFK"]);
        expect(mapping.get(816)).toEqual(["YVVLQPGVK"]);
        expect(mapping.get(9606)).toEqual(["SFALNFK", "QLLVPLLPSLVDR"]);
        expect(mapping.get(2)).toBeFalsy();

        done();
    });
});
