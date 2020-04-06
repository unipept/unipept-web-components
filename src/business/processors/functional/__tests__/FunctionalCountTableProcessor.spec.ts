import EcCountTableProcessor from "@/business/processors/functional/ec/EcCountTableProcessor";
import { Peptide } from "@/business/ontology/raw/Peptide";
import { CountTable } from "@/business/counts/CountTable";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import Setup from "@/test/Setup";
import { EcNamespace } from "@/business/ontology/functional/ec/EcNamespace";

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

/**
 * These tests check the abstract FunctionalCountTableProcessor by processing EC-numbers. This automatically also tests
 * correctness for the other types of annotations, since these all use the same code.
 *
 * @author Pieter Verschaffelt
 */
describe("FunctionalCountTableProcessor", () => {
    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("correctly computes the trust for a count table", async(done) => {
        // First test if the trust is correct without performing a filter on percentage and using a simple count table.
        let ecCountProcessor = new EcCountTableProcessor(countTable, new SearchConfiguration(), 0);

        let trust = await ecCountProcessor.getTrust();
        // Only 3 out of the 4 peptides are annotated with at least one EC-number.
        expect(trust.annotatedPeptides).toBe(3);
        // We did look up 4 peptides
        expect(trust.totalAmountOfPeptides).toBe(4);

        ecCountProcessor = new EcCountTableProcessor(multiCountTable, new SearchConfiguration(true, false, false), 0);

        trust = await ecCountProcessor.getTrust();
        expect(trust.annotatedPeptides).toBe(6);
        expect(trust.totalAmountOfPeptides).toBe(7);

        done();
    });

    it("correctly returns counts over all namespaces", async(done) => {
        let ecCountProcessor = new EcCountTableProcessor(countTable, new SearchConfiguration(), 0);
        let table = await ecCountProcessor.getCountTable();

        expect(table.getCounts("EC:1.4.1.4")).toBe(1);
        expect(table.getCounts("EC:2.7.7.6")).toBe(1);
        expect(table.getCounts("EC:3.5.1.23")).toBe(1);
        expect(table.getCounts("EC:3.5.1.-")).toBe(1);
        expect(table.getCounts("EC:1.1.1.1")).toBe(0);

        // Now also test with the multi counts table
        ecCountProcessor = new EcCountTableProcessor(multiCountTable, new SearchConfiguration(true, false, false), 0);
        table = await ecCountProcessor.getCountTable();
        expect(table.getCounts("EC:1.4.1.4")).toBe(3);
        expect(table.getCounts("EC:2.7.7.6")).toBe(2);
        expect(table.getCounts("EC:3.5.1.23")).toBe(1);
        expect(table.getCounts("EC:3.5.1.-")).toBe(1);
        expect(table.getCounts("EC:1.1.1.1")).toBe(0);

        done();
    });

    it("correctly returns counts for a specific namespace", async(done) => {
        let ecCountProcessor = new EcCountTableProcessor(countTable, new SearchConfiguration(), 0);
        // Namespace associated with 2.x.x.x EC-numbers
        let table = await ecCountProcessor.getCountTable(EcNamespace.Transferases);

        expect(table.getCounts("EC:1.4.1.4")).toBe(0);
        // Only the number from the given namespace should be present!
        expect(table.getCounts("EC:2.7.7.6")).toBe(1);
        expect(table.getCounts("EC:3.5.1.23")).toBe(0);
        expect(table.getCounts("EC:3.5.1.-")).toBe(0);
        expect(table.getCounts("EC:1.1.1.1")).toBe(0);

        // Namespace associated with 7.x.x.x EC-numbers (this should just yield an empty table).
        table = await ecCountProcessor.getCountTable(EcNamespace.Translocases);
        expect(table.getCounts("EC:2.7.7.6")).toBe(0);

        done();
    });

    /**
     * This test checks if the mapping between annotations and the peptides from which they originate is correclty
     * computed.
     */
    it("correctly maps annotations onto their associated peptides", async(done) => {
        const ecCountProcessor = new EcCountTableProcessor(countTable, new SearchConfiguration(), 0);
        const mapping = await ecCountProcessor.getAnnotationPeptideMapping();

        expect(mapping.get("EC:2.7.7.6")).toEqual(["YVVLQPGVK"]);
        expect(mapping.get("EC:3.5.1.23")).toEqual(["QLLVPLLPSLVDR"]);
        expect(mapping.get("EC:1.1.1.1")).toBeFalsy();

        done();
    });
});
