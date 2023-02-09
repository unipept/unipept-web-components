import Peptide from "../../../logic/ontology/peptide/Peptide";
import { MetaProteinResponse } from "./ProteinResponse";
export default class ProteinResponseCommunicator {
    static readonly PROTEIN_ENDPOINT: string;
    private static cachedResponses;
    private static inProgress;
    private static apiBaseUrl;
    static setup(apiBaseUrl: string): void;
    /**
     * Returns the API-response from Unipept that contains all protein information associated with the given peptide.
     *
     * @param peptide The peptide for which UniProt-data should be retrieved.
     * @param equateIl Should we treat the amino acids I and L to be equal during the analysis? This effectively means
     * that all I's in the peptide will be replaced by L's before continuing.
     * @return A list of protein responses that's guaranteed to be sorted by organism name (a -> z).
     */
    getResponse(peptide: Peptide, equateIl: boolean): Promise<MetaProteinResponse | undefined>;
    private compute;
}
