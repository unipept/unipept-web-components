import PeptideCountTableProcessor from "@/business/processors/raw/PeptideCountTableProcessor";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";

const peptides = [
    "AAAAA",
    "AALTER",
    "AALTER",
    "AALTER",
    "QLLVPLLPSLVDR",
    "LVLVNAVYFR",
    "LVLVNAVYFR",
    "LVLVNAVYFR",
    "LQTNGAVPDVLQQGR",
    "LLDQGEAGDNVGLLLR",
    "IIIIII",
    "LLLLLL"
];

const peptideProcessor = new PeptideCountTableProcessor();

describe("PeptideCountTableProcessor", ()=> {
    it ("correctly counts peptides without filtering", async(done) => {
        const countTable = await peptideProcessor.getPeptideCountTable(peptides, new SearchConfiguration(false, false, false));

        expect(countTable.getOntologyIds().sort()).toEqual([
            "AAAAA",
            "AALTER",
            "QLLVPLLPSLVDR",
            "LVLVNAVYFR",
            "LQTNGAVPDVLQQGR",
            "LLDQGEAGDNVGLLLR",
            "IIIIII",
            "LLLLLL"
        ].sort());

        expect(countTable.getCounts("AAAAA")).toBe(1);
        expect(countTable.getCounts("AALTER")).toBe(3);
        expect(countTable.getCounts("LVLVNAVYFR")).toBe(3);
        expect(countTable.getCounts("IIIIII")).toBe(1);
        expect(countTable.getCounts("LLLLLL")).toBe(1);
        expect(countTable.getCounts("SSSSSS")).toBe(0);

        done();
    });

    it("correctly equates I/L", async(done) => {
        const countTable = await peptideProcessor.getPeptideCountTable(peptides, new SearchConfiguration(true, false, false));

        expect(countTable.getOntologyIds().sort()).toEqual([
            "AAAAA",
            "AALTER",
            "QLLVPLLPSLVDR",
            "LVLVNAVYFR",
            "LQTNGAVPDVLQQGR",
            "LLDQGEAGDNVGLLLR",
            "LLLLLL"
        ].sort());

        // All I's are translated into L's and thus the all-L peptide should now occur 2 times!
        expect(countTable.getCounts("LLLLLL")).toBe(2);

        done();
    });

    it("correctly filters duplicates", async(done) => {
        let countTable = await peptideProcessor.getPeptideCountTable(peptides, new SearchConfiguration(false, true, false));

        expect(countTable.getOntologyIds().sort()).toEqual([
            "AAAAA",
            "AALTER",
            "QLLVPLLPSLVDR",
            "LVLVNAVYFR",
            "LQTNGAVPDVLQQGR",
            "LLDQGEAGDNVGLLLR",
            "IIIIII",
            "LLLLLL"
        ].sort());

        // All peptides should now only occur once!
        expect(countTable.getCounts("AAAAA")).toBe(1);
        expect(countTable.getCounts("AALTER")).toBe(1);
        expect(countTable.getCounts("LVLVNAVYFR")).toBe(1);
        expect(countTable.getCounts("IIIIII")).toBe(1);
        expect(countTable.getCounts("LLLLLL")).toBe(1);
        expect(countTable.getCounts("SSSSSS")).toBe(0);

        // Also make sure that counts for peptides that are equated with I/L are correct.
        countTable = await peptideProcessor.getPeptideCountTable(peptides, new SearchConfiguration(true, true, false));

        expect(countTable.getCounts("LLLLLL")).toBe(1);
        expect(countTable.getCounts("IIIIII")).toBe(0);

        done();
    });

    it("correctly filters peptides that are too short", async(done) => {
        const shortPeptides = [
            "AA",
            "R",
            "SSSS",
            "AAAAA"
        ];

        const peptideTable = await peptideProcessor.getPeptideCountTable(shortPeptides, new SearchConfiguration(false, false, false));
        expect(peptideTable.getOntologyIds()).toEqual(["AAAAA"]);

        done();
    });
});
