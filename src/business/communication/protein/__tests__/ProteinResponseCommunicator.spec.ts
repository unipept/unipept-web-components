import Setup from "@/test/Setup";
import ProteinResponseCommunicator from "@/business/communication/protein/ProteinResponseCommunicator";

describe("ProteinResponseCommunicator", () => {
    beforeAll(() => {
        const setup = new Setup();
        setup.setupAll();
    });

    it("correctly fetches response from the Unipept API", async() => {
        const proteinCommunicator = new ProteinResponseCommunicator();
        const response = await proteinCommunicator.getResponse("AALTER", true);

        expect(response).toMatchSnapshot();
    });
});
