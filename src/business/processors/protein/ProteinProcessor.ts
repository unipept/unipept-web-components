import { Peptide } from "./../../ontology/raw/Peptide";
import ProteinDefinition from "./../../ontology/protein/ProteinDefinition";
import ProteinResponseCommunicator from "./../../communication/protein/ProteinResponseCommunicator";
import { NcbiId } from "./../../ontology/taxonomic/ncbi/NcbiTaxon";

export default class ProteinProcessor {
    private proteins: ProteinDefinition[];
    private lca: NcbiId;
    private commonLineage: NcbiId[];

    /**
     * Returns a list of protein definitions associated with the given peptide. These definitions are guaranteed to be
     * sorted by organism name.
     */
    public getProteins(): ProteinDefinition[] {
        return this.proteins;
    }

    /**
     * Returns the id of the lowest common ancestor NCBI-taxon for the given peptide and search configuration. Returns
     * undefined in the event that no LCA was found.
     */
    public getLca(): NcbiId {
        return this.lca
    }

    /**
     * Compute the common lineage for all organisms associated with the proteins that matched with the given peptide.
     */
    public getCommonLineage(): NcbiId[] {
        return this.commonLineage;
    }

    /**
     * @param peptide The peptide for which we need to retrieve all protein definitions.
     * @param equateIl Whether the amino acids "I" and "L" in a peptide should be treated equally.
     */
    public async compute(peptide: Peptide, equateIl: boolean): Promise<void> {
        const proteinResponseCommunicator = new ProteinResponseCommunicator();
        const response = await proteinResponseCommunicator.getResponse(peptide, equateIl);

        if (response) {
            this.proteins = response.proteins.map(response => new ProteinDefinition(
                response.uniprotAccessionId,
                response.name,
                response.organism,
                response.ecNumbers,
                response.goTerms,
                response.interproEntries
            ));

            this.lca = response.lca;
            this.commonLineage = response.common_lineage;
        }
    }
}
