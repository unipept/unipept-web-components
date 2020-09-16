import OntologyProcessor from "./../../OntologyProcessor";
import NcbiTaxon, { NcbiId } from "./NcbiTaxon";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
import Worker from "worker-loader?inline=fallback!./NcbiOntologyProcessor.worker";
import async, { AsyncQueue } from "async";
import NcbiResponse from "@/business/communication/taxonomic/ncbi/NcbiResponse";

export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    public static NCBI_ONTOLOGY_PARALLEL_LIMIT = 2;

    private static queue: AsyncQueue<any>;

    constructor(private readonly comSource: CommunicationSource) {}

    public async getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>> {
        return await this.getOntologyByIds(table.getOntologyIds());
    }

    public async getOntologyByIds(ids: NcbiId[]): Promise<Ontology<NcbiId, NcbiTaxon>> {
        if (!NcbiOntologyProcessor.queue) {
            NcbiOntologyProcessor.queue = async.queue((
                task: { data: [NcbiId[], Map<number, NcbiResponse>] },
                callback: (a: any) => void
            ) => {
                const worker = new Worker();

                worker.addEventListener("message", (event: MessageEvent) => {
                    const definitions = event.data.result;
                    callback(new Ontology<NcbiId, NcbiTaxon>(definitions));
                });

                worker.postMessage({
                    args: task.data
                });
            }, NcbiOntologyProcessor.NCBI_ONTOLOGY_PARALLEL_LIMIT);
        }

        const communicator = this.comSource.getNcbiCommunicator();
        await communicator.process(ids);

        return new Promise<Ontology<NcbiId, NcbiTaxon>>((resolve) => {
            NcbiOntologyProcessor.queue.push({
                data: [ids, communicator.getResponseMap()]
            }, resolve);
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
