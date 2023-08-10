import Peptide from "../../../logic/ontology/peptide/Peptide";
import NetworkUtils from "../NetworkUtils";
import { MetaProteinResponse } from "./ProteinResponse";

export default class ProteinResponseCommunicator {
    public static readonly PROTEIN_ENDPOINT: string = "/private_api/proteins";

    // Maps a peptide and it's search settings (equateIl) onto the previously received protein responses.
    private static cachedResponses: Map<string, MetaProteinResponse> = new Map();
    private static inProgress: Promise<void> | undefined;

    private static apiBaseUrl = "http://api.unipept.ugent.be"

    public static setup(apiBaseUrl: string) {
        this.apiBaseUrl = apiBaseUrl;
    }

    /**
     * Returns the API-response from Unipept that contains all protein information associated with the given peptide.
     *
     * @param peptide The peptide for which UniProt-data should be retrieved.
     * @param equateIl Should we treat the amino acids I and L to be equal during the analysis? This effectively means
     * that all I's in the peptide will be replaced by L's before continuing.
     * @return A list of protein responses that's guaranteed to be sorted by organism name (a -> z).
     */
    public async getResponse(peptide: Peptide, equateIl: boolean): Promise<MetaProteinResponse | undefined> {
        if (ProteinResponseCommunicator.inProgress) {
            await ProteinResponseCommunicator.inProgress;
        }

        ProteinResponseCommunicator.inProgress = this.compute(peptide, equateIl);
        await ProteinResponseCommunicator.inProgress;
        ProteinResponseCommunicator.inProgress = undefined;

        return ProteinResponseCommunicator.cachedResponses.get(JSON.stringify([peptide, equateIl]));
    }

    private async compute(peptide: Peptide, equateIl: boolean): Promise<void> {
        const config: string = JSON.stringify([peptide, equateIl]);
        if (ProteinResponseCommunicator.cachedResponses.has(config)) {
            return;
        }

        const data = JSON.stringify({
            peptide: peptide,
            equateIl: equateIl
        });

        const response: MetaProteinResponse = await NetworkUtils.postJSON(
            ProteinResponseCommunicator.apiBaseUrl + ProteinResponseCommunicator.PROTEIN_ENDPOINT, data
        );

        ProteinResponseCommunicator.cachedResponses.set(config, response);
    }
}
