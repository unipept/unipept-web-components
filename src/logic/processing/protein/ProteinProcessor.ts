import ProteinResponseCommunicator from "../../../logic/communication/protein/ProteinResponseCommunicator";
import Peptide from "../../../logic/ontology/peptide/Peptide";
import ProteinDefinition from "../../../logic/ontology/protein/ProteinDefinition";
import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";

export default class ProteinProcessor {
    private proteins: ProteinDefinition[];
    private lca: NcbiId;
    private commonLineage: NcbiId[];
    private communicator: ProteinResponseCommunicator;

    constructor(communicator: ProteinResponseCommunicator) {
        this.proteins = [];
        this.lca = -1;
        this.commonLineage = [];

        this.communicator = communicator;
    }

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
        const response = await this.communicator.getResponse(peptide, equateIl);

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