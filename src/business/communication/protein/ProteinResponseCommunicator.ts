import { Peptide } from "./../../ontology/raw/Peptide";
import ProteinResponse from "./../protein/ProteinResponse";
import NetworkUtils from "./../NetworkUtils";
import NetworkConfiguration from "./../NetworkConfiguration";

export default class ProteinResponseCommunicator {
    public static readonly PROTEIN_ENDPOINT: string = "/private_api/proteins";

    /**
     * Returns the API-response from Unipept that contains all protein information associated with the given peptide.
     *
     * @param peptide The peptide for which UniProt-data should be retrieved.
     * @param equateIl Should we treat the amino acids I and L to be equal during the analysis? This effectively means
     * that all I's in the peptide will be replaced by L's before continuing.
     * @return A list of protein responses that's guaranteed to be sorted by organism name (a -> z).
     */
    public async getResponse(peptide: Peptide, equateIl: boolean): Promise<ProteinResponse[]> {
        const data = JSON.stringify({
            peptide: peptide,
            equateIl: equateIl
        });

        return await NetworkUtils.postJSON(
            NetworkConfiguration.BASE_URL + ProteinResponseCommunicator.PROTEIN_ENDPOINT,
            data
        );
    }
}
