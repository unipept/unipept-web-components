import Peptide from "../../../logic/ontology/peptide/Peptide";
import ProteinDefinition from "../../../logic/ontology/protein/ProteinDefinition";
import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";
export default class ProteinProcessor {
    private proteins;
    private lca;
    private commonLineage;
    constructor();
    /**
     * Returns a list of protein definitions associated with the given peptide. These definitions are guaranteed to be
     * sorted by organism name.
     */
    getProteins(): ProteinDefinition[];
    /**
     * Returns the id of the lowest common ancestor NCBI-taxon for the given peptide and search configuration. Returns
     * undefined in the event that no LCA was found.
     */
    getLca(): NcbiId;
    /**
     * Compute the common lineage for all organisms associated with the proteins that matched with the given peptide.
     */
    getCommonLineage(): NcbiId[];
    /**
     * @param peptide The peptide for which we need to retrieve all protein definitions.
     * @param equateIl Whether the amino acids "I" and "L" in a peptide should be treated equally.
     */
    compute(peptide: Peptide, equateIl: boolean): Promise<void>;
}
