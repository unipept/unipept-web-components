import { Peptide } from "./../../ontology/raw/Peptide";
import ProteinDefinition from "./../../ontology/protein/ProteinDefinition";
import ProteinResponseCommunicator from "./../../communication/protein/ProteinResponseCommunicator";
import { NcbiId } from "./../../ontology/taxonomic/ncbi/NcbiTaxon";

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
        const response = await proteinResponseCommunicator.getResponse(peptide, equateIl);

        if (response) {
            return response.proteins.map(response => new ProteinDefinition(
                response.uniprotAccessionId,
                response.name,
                response.organism,
                response.ecNumbers,
                response.goTerms,
                response.interproEntries
            ));
        } else {
            return undefined;
        }
    }

    /**
     * Returns the id of the lowest common ancestor NCBI-taxon for the given peptide and search configuration. Returns
     * undefined in the event that no LCA was found.
     *
     * @param peptide The peptide for which the lowest common ancestor must be found.
     * @param equateIl The search settings that need to be applied.
     */
    public async getLcaByPeptide(peptide: Peptide, equateIl: boolean): Promise<NcbiId> {
        const proteinResponseCommunicator = new ProteinResponseCommunicator();
        const response = await proteinResponseCommunicator.getResponse(peptide, equateIl);

        if (response && response.lca >= 0) {
            return response.lca;
        } else {
            return undefined;
        }
    }

    /**
     * Compute the common lineage for all organisms associated with the proteins that matched with the given peptide.
     *
     * @param peptide The peptide for which the common lineage should be computed.
     * @param equateIl The search settings that need to be applied.
     */
    public async getCommonLineageByPeptide(peptide: Peptide, equateIl: boolean): Promise<NcbiId[]> {
        const proteinResponseCommunicator = new ProteinResponseCommunicator();
        const response = await proteinResponseCommunicator.getResponse(peptide, equateIl);

        if (response) {
            return response.common_lineage;
        } else {
            return [];
        }
    }
}
