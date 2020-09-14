import { Peptide } from "./../../ontology/raw/Peptide";
import ProteinDefinition from "./../../ontology/protein/ProteinDefinition";
import { NcbiId } from "./../../ontology/taxonomic/ncbi/NcbiTaxon";
export default class ProteinProcessor {
    /**
     * Returns a list of protein definitions associated with the given peptide. These definitions are guaranteed to be
     * sorted by organism name.
     *
     * @param peptide The peptide for which we need to retrieve all protein definitions.
     * @param equateIl Whether the amino acids "I" and "L" in a peptide should be treated equally.
     */
    getProteinsByPeptide(peptide: Peptide, equateIl: boolean): Promise<ProteinDefinition[]>;
    /**
     * Returns the id of the lowest common ancestor NCBI-taxon for the given peptide and search configuration. Returns
     * undefined in the event that no LCA was found.
     *
     * @param peptide The peptide for which the lowest common ancestor must be found.
     * @param equateIl The search settings that need to be applied.
     */
    getLcaByPeptide(peptide: Peptide, equateIl: boolean): Promise<NcbiId>;
    /**
     * Compute the common lineage for all organisms associated with the proteins that matched with the given peptide.
     *
     * @param peptide The peptide for which the common lineage should be computed.
     * @param equateIl The search settings that need to be applied.
     */
    getCommonLineageByPeptide(peptide: Peptide, equateIl: boolean): Promise<NcbiId[]>;
}
