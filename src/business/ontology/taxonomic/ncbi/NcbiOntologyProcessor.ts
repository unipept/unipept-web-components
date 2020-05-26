import OntologyProcessor from "./../../OntologyProcessor";
import NcbiTaxon, { NcbiId } from "./NcbiTaxon";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
import { spawn, Worker } from "threads";

export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    private static worker;

    constructor(private readonly comSource: CommunicationSource) {}

    public async getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>> {
        return await this.getOntologyByIds(table.getOntologyIds());
    }

    public async getOntologyByIds(ids: NcbiId[]): Promise<Ontology<NcbiId, NcbiTaxon>> {
        const communicator = this.comSource.getNcbiCommunicator();
        await communicator.process(ids);

        if (!NcbiOntologyProcessor.worker) {
            NcbiOntologyProcessor.worker = await spawn(new Worker("./NcbiOntologyProcessor.worker.ts"));
        }
        const definitions = await NcbiOntologyProcessor.worker.process(ids, communicator.getResponseMap());

        return new Ontology<NcbiId, NcbiTaxon>(definitions);
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
