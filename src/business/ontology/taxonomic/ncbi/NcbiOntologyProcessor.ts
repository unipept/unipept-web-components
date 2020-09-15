import OntologyProcessor from "./../../OntologyProcessor";
import NcbiTaxon, { NcbiId } from "./NcbiTaxon";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
import Worker from "worker-loader?inline=fallback!./NcbiOntologyProcessor.worker";

export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    // private static pool = Pool(
    //     () => spawn(new Worker("./NcbiOntologyProcessor.worker.ts")),
    //     2
    // );

    private static worker = new Worker();

    constructor(private readonly comSource: CommunicationSource) {}

    public async getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>> {
        return await this.getOntologyByIds(table.getOntologyIds());
    }

    public async getOntologyByIds(ids: NcbiId[]): Promise<Ontology<NcbiId, NcbiTaxon>> {
        return new Promise<Ontology<NcbiId, NcbiTaxon>>(async(resolve) => {
            NcbiOntologyProcessor.worker.addEventListener("message", (event: MessageEvent) => {
                const definitions = event.data.result;
                resolve(new Ontology<NcbiId, NcbiTaxon>(definitions));
            });

            const communicator = this.comSource.getNcbiCommunicator();
            await communicator.process(ids);

            NcbiOntologyProcessor.worker.postMessage({
                args: [ids, communicator.getResponseMap()]
            })

            // NcbiOntologyProcessor.pool.queue(async(worker) => {
            //     const communicator = this.comSource.getNcbiCommunicator();
            //     await communicator.process(ids);
            //
            //     const definitions = await worker.process(ids, communicator.getResponseMap());
            //
            //     resolve(new Ontology<NcbiId, NcbiTaxon>(definitions));
            // })
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
