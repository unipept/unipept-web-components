import Mock from "@/test/Mock";
import PeptideExport from "@/business/export/PeptideExport";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import DefaultCommunicationSource from "@/business/communication/source/DefaultCommunicationSource";
import Setup from "@/test/Setup";

describe("PeptideExport", () => {
    beforeEach(() => {
        const setup = new Setup();
        setup.setupAll();
    })

    it("produces a correct CSV output", async(done) => {
        // const mock = new Mock();
        // const peptideCountTable = await mock.mockRealisticPeptideCountTable();
        //
        // const result = await PeptideExport.exportSummaryAsCsv(
        //     peptideCountTable,
        //     new SearchConfiguration(),
        //     new DefaultCommunicationSource()
        // );
        // expect(result).toMatchSnapshot();
        //
        // done();
    });
});
