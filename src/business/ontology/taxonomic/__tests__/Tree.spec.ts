import Setup from "@/test/Setup";
import Mock from "@/test/Mock";
import Tree from "@/business/ontology/taxonomic/Tree";

describe("Tree", () => {
    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    // TODO: also add a manually drawn test that can easily be reproduced and tested on paper.

    it("correctly constructs a tree from real-world data", async() => {
        const mock = new Mock();

        const taxaCounts = await mock.mockRealisticLcaCountTable();
        const ncbiOntology = await mock.mockRealisticNcbiOntology();

        const tree = new Tree(taxaCounts, ncbiOntology);
        expect(tree).toMatchSnapshot();
    });
});
