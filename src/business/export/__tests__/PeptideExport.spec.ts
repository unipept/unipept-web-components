import Mock from "@/test/Mock";
import PeptideExport from "@/business/export/PeptideExport";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";

describe("PeptideExport", () => {
    it("produces a correct CSV output", async(done) => {
        const mock = new Mock();
        const peptideCountTable = await mock.mockRealisticPeptideCountTable();

        const result = await PeptideExport.exportSummaryAsCsv(peptideCountTable, new SearchConfiguration());
        expect(result).toMatchSnapshot();

        done();
    });
});
