import Setup from "@/test/Setup";
import GoProteinCountTableProcessor from "@/business/processors/functional/go/GoProteinCountTableProcessor";
import { GoNamespace } from "@/business/ontology/functional/go/GoNamespace";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";

describe("FunctionalProteinCountTableProcessor", () => {
    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("correctly computes the trust for a peptide", async() => {
        const goCountProcessor = new GoProteinCountTableProcessor("ATSST", true, new DefaultCommunicationSource());

        let trust = await goCountProcessor.getTrust();

        // Only two out of three proteins are annotated with a GO-term.
        expect(trust.annotatedItems).toBe(2);
        expect(trust.totalAmountOfItems).toBe(3);
    });

    it("correctly returns counts over all namespaces", async() => {
        const goCountProcessor = new GoProteinCountTableProcessor("ATSST", true, new DefaultCommunicationSource());
        const table = await goCountProcessor.getCountTable();

        expect(table.getCounts("GO:0005737")).toBe(2);
        expect(table.getCounts("GO:0005524")).toBe(1);
        expect(table.getCounts("GO:0000000")).toBe(0);
    });

    it("correctly returns counts for one namespace", async() => {
        const goCountProcessor = new GoProteinCountTableProcessor("ATSST", true, new DefaultCommunicationSource());
        const table = await goCountProcessor.getCountTable(GoNamespace.CellularComponent);

        expect(table.getCounts("GO:0005737")).toBe(2);
        expect(table.getCounts("GO:0005524")).toBe(0);
        expect(table.getCounts("GO:0000000")).toBe(0);
    });
});
