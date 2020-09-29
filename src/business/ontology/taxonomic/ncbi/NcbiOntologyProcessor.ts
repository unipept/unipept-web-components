import OntologyProcessor from "./../../OntologyProcessor";
import NcbiTaxon, { NcbiId } from "./NcbiTaxon";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
import Worker from "worker-loader?inline=fallback!./NcbiOntologyProcessor.worker";
import { QueueManager, CountTable, Ontology } from "@/business";

export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    constructor(private readonly comSource: CommunicationSource) {}

    public async getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>> {
        return await this.getOntologyByIds(table.getOntologyIds());
    }

    public async getOntologyByIds(ids: NcbiId[]): Promise<Ontology<NcbiId, NcbiTaxon>> {
        const communicator = this.comSource.getNcbiCommunicator();
        await communicator.process(ids);

        return QueueManager.getLongRunningQueue().pushTask<Ontology<NcbiId, NcbiTaxon>>(() => {
            return new Promise<Ontology<NcbiId, NcbiTaxon>>((resolve) => {
                const worker = new Worker();

                worker.addEventListener("message", (event: MessageEvent) => {
                    const definitions = event.data.result;
                    worker.terminate();
                    resolve(new Ontology<NcbiId, NcbiTaxon>(definitions));
                });

                worker.postMessage({
                    args: [ids, communicator.getResponseMap()]
                });
            })
        });
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
