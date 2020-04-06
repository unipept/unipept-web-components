import Setup from "@/test/Setup";
import NcbiTaxon, { NcbiId } from "@/business/ontology/taxonomic/ncbi/NcbiTaxon";
import { CountTable } from "@/business/counts/CountTable";
import NcbiOntologyProcessor from "@/business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import { NcbiRank } from "@/business/ontology/taxonomic/ncbi/NcbiRank";

const ncbiIds = new Map<NcbiId, number>([
    [2, 1],
    [816, 1],
    [815, 1]
]);

describe("NcbiOntologyProcessor", () => {
    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("returns a correct ontology for a NCBI count table", async() => {
        const ncbiCounts = new CountTable<NcbiId>(ncbiIds);

        const ncbiOntologyProcessor = new NcbiOntologyProcessor();
        const ontology = await ncbiOntologyProcessor.getOntology(ncbiCounts);

        expect(ontology.getDefinition(2)).toEqual({
            id: 2,
            name: "Bacteria",
            rank: NcbiRank.Superkingdom,
            lineage: [
                2,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ]
        });

        expect(ontology.getDefinition(816)).toEqual({
            id: 816,
            name: "Bacteroides",
            rank: NcbiRank.Genus,
            lineage: [
                2,
                null,
                null,
                null,
                976,
                null,
                null,
                200643,
                null,
                null,
                null,
                171549,
                null,
                null,
                null,
                null,
                815,
                null,
                null,
                null,
                816,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ]
        });

        // Also expect that all id's that are part of a lineage where fetched!
        expect(ontology.getDefinition(200643)).toEqual({
            id: 200643,
            name: "Bacteroidia",
            rank: NcbiRank.Class,
            lineage: [
                2,
                null,
                null,
                null,
                976,
                null,
                null,
                200643,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ]
        });

        expect(ontology.getDefinition(548742315)).toBeFalsy();
    });

    it("correctly fetches one definition at a time if requested", async() => {
        const ncbiOntologyProcessor = new NcbiOntologyProcessor();

        expect(await ncbiOntologyProcessor.getDefinition(816)).toEqual({
            id: 816,
            name: "Bacteroides",
            rank: NcbiRank.Genus,
            lineage: [
                2,
                null,
                null,
                null,
                976,
                null,
                null,
                200643,
                null,
                null,
                null,
                171549,
                null,
                null,
                null,
                null,
                815,
                null,
                null,
                null,
                816,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ]
        });

        expect(await ncbiOntologyProcessor.getDefinition(241654321)).toBeFalsy();
    });
});
