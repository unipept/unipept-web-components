import NcbiResponse from "../../../logic/communication/taxonomic/NcbiResponse";
import NcbiResponseCommunicator from "../../../logic/communication/taxonomic/NcbiResponseCommunicator";
import Ontology from "../../../logic/ontology/Ontology";
import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";
import NcbiTaxon from "../../../logic/ontology/taxonomic/NcbiTaxon";
import QueueManager from "../../../logic/util/queue/QueueManager";
import CountTable from "../CountTable";
import OntologyProcessor from "../OntologyProcessor";

export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    constructor(private readonly ncbiCommunicator: NcbiResponseCommunicator) {}

    public async getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>> {
        return this.getOntologyByIds(table.getOntologyIds());
    }

    /**
     * @param ids The NCBI id's for which all associated taxa information should be retrieved.
     * @param withLineage Should all taxa that are a child of one of the given NCBI id's also be retrieved?
     */
    public async getOntologyByIds(ids: NcbiId[], withLineage = true): Promise<Ontology<NcbiId, NcbiTaxon>> {
        await this.ncbiCommunicator.process(ids);

        const result: Map<NcbiId, NcbiTaxon> = await QueueManager.getLongRunningQueue().pushTask<
            Map<NcbiId, NcbiTaxon>, [NcbiId[], Map<NcbiId, NcbiResponse>, boolean]
        >("computeNcbiOntology", [ids, this.ncbiCommunicator.getResponseMap(), withLineage]);

        return new Ontology<NcbiId, NcbiTaxon>(result);
    }

    public async getDefinition(id: NcbiId): Promise<NcbiTaxon | undefined> {
        await this.ncbiCommunicator.process([id]);
        const response = this.ncbiCommunicator.getResponse(id);
        if (response) {
            return new NcbiTaxon(id, response.name, response.rank, response.lineage);
        } else {
            return undefined;
        }
    }
}
