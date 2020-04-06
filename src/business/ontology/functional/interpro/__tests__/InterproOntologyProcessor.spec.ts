import Setup from "@/test/Setup";
import InterproOntologyProcessor from "@/business/ontology/functional/interpro/InterproOntologyProcessor";
import { InterproCode } from "@/business/ontology/functional/interpro/InterproDefinition";
import { CountTable } from "@/business/counts/CountTable";
import { InterproNamespace } from "@/business/ontology/functional/interpro/InterproNamespace";

const interproIds = new Map([
    ["IPR:IPR000180", 1],
    ["IPR:IPR018114", 1],
    ["IPR:IPR033116", 1],
    ["IPR:IPR015887", 1],
    ["IPR:IPR003146", 1]
]);

describe("InterproOntologyProcessor", () => {
    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("returns a correct ontology for an InterPro count table", async() => {
        const interproCounts = new CountTable<InterproCode>(interproIds);

        const interproProcessor = new InterproOntologyProcessor();
        const ontology = await interproProcessor.getOntology(interproCounts);

        expect(ontology.getDefinition("IPR:IPR000180")).toBeTruthy();
        expect(ontology.getDefinition("IPR:IPR000180")).toEqual(
            {
                code: "IPR:IPR000180",
                name: "Membrane dipeptidase, active site",
                namespace: InterproNamespace.ActiveSite
            }
        );

        expect(ontology.getDefinition("IPR:IPR018114")).toBeTruthy();
        expect(ontology.getDefinition("IPR:IPR018114")).toEqual({
            code: "IPR:IPR018114",
            name: "Serine proteases, trypsin family, histidine active site",
            namespace: InterproNamespace.ActiveSite
        });

        expect(ontology.getDefinition("IPR:IPR003146")).toBeTruthy();
        expect(ontology.getDefinition("IPR:IPR003146")).toEqual({
            code: "IPR:IPR003146",
            name: "Carboxypeptidase, activation peptide",
            namespace: InterproNamespace.Domain
        });

        expect(ontology.getDefinition("IPR:IPR000000")).toBeFalsy();
    });

    it("correctly fetches one definition at a time if requested", async() => {
        const interproProcessor = new InterproOntologyProcessor();
        let definition = await interproProcessor.getDefinition("IPR:IPR003018");

        expect(definition).toEqual({
            code: "IPR:IPR003018",
            name: "GAF domain",
            namespace: InterproNamespace.Domain
        });

        definition = await interproProcessor.getDefinition("IPR:IPR001294");
        expect(definition).toEqual({
            code: "IPR:IPR001294",
            name: "Phytochrome",
            namespace: InterproNamespace.Family
        });

        expect(await interproProcessor.getDefinition("GO:000000")).toBeFalsy();
    });
});
