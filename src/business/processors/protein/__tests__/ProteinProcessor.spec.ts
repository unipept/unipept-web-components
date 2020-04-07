import Setup from "@/test/Setup";
import ProteinProcessor from "@/business/processors/protein/ProteinProcessor";
import ProteinDefinition from "@/business/ontology/protein/ProteinDefinition";

describe("ProteinProcessor", () => {
    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    })

    it("correctly parses protein responses", async() => {
        const proteinProcessor = new ProteinProcessor();
        const proteinDefinition: ProteinDefinition[] = await proteinProcessor.getProteinsByPeptide("AALTER", true);

        expect(proteinDefinition.length).toEqual(8);
        expect(proteinDefinition).toMatchSnapshot();
    })
});
