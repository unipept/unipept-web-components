import Setup from "@/test/Setup";
import { EcCode } from "@/business/ontology/functional/ec/EcDefinition";
import { CountTable } from "@/business/counts/CountTable";
import EcOntologyProcessor from "@/business/ontology/functional/ec/EcOntologyProcessor";
import { EcNamespace } from "@/business/ontology/functional/ec/EcNamespace";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";

const ecCodes = new Map([
    ["EC:1.-.-.-", 1],
    ["EC:1.4.1.4", 1],
    ["EC:2.5.1.90", 1]
]);

describe("EcOntologyProcessor", () => {
    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("returns a correct ontology for an Enzyme Commission count table", async() => {
        const ecCounts = new CountTable<EcCode>(ecCodes);

        const ecOntologyProcessor = new EcOntologyProcessor(new DefaultCommunicationSource("http://unipept.ugent.be").getEcCommunicator());
        const ontology = await ecOntologyProcessor.getOntology(ecCounts);

        expect(ontology.getDefinition("EC:1.4.1.4")).toEqual({
            code: "EC:1.4.1.4",
            name: "Glutamate dehydrogenase (NADP(+))",
            namespace: EcNamespace.Oxidoreductases,
            level: 4
        });

        expect(ontology.getDefinition("EC:0.0.0.0")).toBeFalsy();
    });

    it("correctly fetches one definition at a time if requested", async() => {
        const ecProcessor = new EcOntologyProcessor(new DefaultCommunicationSource("http://unipept.ugent.be").getEcCommunicator());

        expect(await ecProcessor.getDefinition("EC:1.4.-.-")).toEqual({
            code: "EC:1.4.-.-",
            name: "Acting on the CH-NH(2) group of donors",
            namespace: EcNamespace.Oxidoreductases,
            level: 2
        });

        expect(await ecProcessor.getDefinition("EC:0.0.0.0")).toBeFalsy();
    });
});
