import {
    QueueManager,
    CountTable,
    Ontology,
    NcbiResponse,
    OntologyProcessor,
    NcbiTaxon,
    NcbiId,
    CommunicationSource
} from "@/business";

export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    constructor(private readonly comSource: CommunicationSource) {}

    public async getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>> {
        return await this.getOntologyByIds(table.getOntologyIds());
    }

    public async getOntologyByIds(ids: NcbiId[]): Promise<Ontology<NcbiId, NcbiTaxon>> {
        const communicator = this.comSource.getNcbiCommunicator();
        await communicator.process(ids);

        const result: Map<NcbiId, NcbiTaxon> = await QueueManager.getLongRunningQueue().pushTask<
            Map<NcbiId, NcbiTaxon>, [NcbiId[], Map<NcbiId, NcbiResponse>]
        >("computeNcbiOntology", [ids, communicator.getResponseMap()]);

        return new Ontology<NcbiId, NcbiTaxon>(result);
    }

    public async getDefinition(id: NcbiId): Promise<NcbiTaxon> {
        const communicator = this.comSource.getNcbiCommunicator();
        await communicator.process([id]);
        const response = communicator.getResponse(id);
        if (response) {
            return new NcbiTaxon(id, response.name, response.rank, response.lineage);
        } else {
            return undefined;
        }
    }
}
