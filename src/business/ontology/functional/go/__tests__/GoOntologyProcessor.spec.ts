import Setup from "@/test/Setup";
import { GoCode } from "@/business/ontology/functional/go/GoDefinition";
import { CountTable } from "@/business/counts/CountTable";
import GoOntologyProcessor from "@/business/ontology/functional/go/GoOntologyProcessor";
import { GoNamespace } from "@/business/ontology/functional/go/GoNamespace";

const goCodes = new Map([
    ["GO:0000122", 1],
    ["GO:0000139", 1],
    ["GO:0000398", 1]
]);

describe("GoOntologyProcessor", () => {
    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("returns a correct ontology for an Gene Ontology count table", async() => {
        const goCounts = new CountTable<GoCode>(goCodes);

        const goProcessor = new GoOntologyProcessor();
        const ontology = await goProcessor.getOntology(goCounts);

        expect(ontology.getDefinition("GO:0000122")).toBeTruthy();
        expect(ontology.getDefinition("GO:0000122")).toEqual({
            code: "GO:0000122",
            name: "negative regulation of transcription by RNA polymerase II",
            namespace: GoNamespace.BiologicalProcess
        });

        expect(ontology.getDefinition("GO:0000139")).toBeTruthy();
        expect(ontology.getDefinition("GO:0000139")).toEqual({
            code: "GO:0000139",
            name: "Golgi membrane",
            namespace: GoNamespace.CellularComponent
        });

        expect(ontology.getDefinition("GO:000000")).toBeFalsy();
    });

    it("correctly fetches one definition at a time if requested", async() => {
        const goProcessor = new GoOntologyProcessor();
        let definition = await goProcessor.getDefinition("GO:0000122");

        expect(definition).toEqual({
            code: "GO:0000122",
            name: "negative regulation of transcription by RNA polymerase II",
            namespace: GoNamespace.BiologicalProcess
        });

        definition = await goProcessor.getDefinition("GO:0000139");
        expect(definition).toEqual({
            code: "GO:0000139",
            name: "Golgi membrane",
            namespace: GoNamespace.CellularComponent
        });

        expect(await goProcessor.getDefinition("GO:000000")).toBeFalsy();
    });
});
