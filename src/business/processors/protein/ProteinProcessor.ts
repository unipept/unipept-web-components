import { Peptide } from "./../../ontology/raw/Peptide";
import ProteinDefinition from "./../../ontology/protein/ProteinDefinition";
import ProteinResponseCommunicator from "./../../communication/protein/ProteinResponseCommunicator";

export default class ProteinProcessor {
    /**
     * Returns a list of protein definitions associated with the given peptide. These definitions are guaranteed to be
     * sorted by organism name.
     *
     * @param peptide The peptide for which we need to retrieve all protein definitions.
     * @param equateIl Whether the amino acids "I" and "L" in a peptide should be treated equally.
     */
    public async getProteinsByPeptide(peptide: Peptide, equateIl: boolean): Promise<ProteinDefinition[]> {
        const proteinResponseCommunicator = new ProteinResponseCommunicator();
        const responses = await proteinResponseCommunicator.getResponse(peptide, equateIl);

        return responses.map(response => new ProteinDefinition(
            response.uniprotAccessionId,
            response.name,
            response.organism,
            response.ecNumbers,
            response.goTerms,
            response.interproEntries
        ));
    }
}
