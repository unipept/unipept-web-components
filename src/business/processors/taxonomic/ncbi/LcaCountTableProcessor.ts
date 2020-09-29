import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import ProteomicsCountTableProcessor from "./../../ProteomicsCountTableProcessor";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
import Worker from "worker-loader?inline=fallback!./LcaCountTableProcessor.worker";
import { QueueManager } from "@/business";

export default class LcaCountTableProcessor implements ProteomicsCountTableProcessor<NcbiId> {
    private countTable: CountTable<NcbiId>;
    private lca2Peptides: Map<NcbiId, Peptide[]>;

    constructor(
        private readonly peptideCountTable: CountTable<Peptide>,
        private readonly configuration: SearchConfiguration,
        private readonly communicationSource: CommunicationSource
    ) {}

    public cancel() {
        // TODO implement...
    }

    public isCancelled(): boolean {
        return false;
    }

    public async getCountTable(): Promise<CountTable<NcbiId>> {
        await this.compute();
        return this.countTable;
    }

    public async getAnnotationPeptideMapping(): Promise<Map<NcbiId, Peptide[]>> {
        await this.compute();
        return this.lca2Peptides;
    }

    protected async compute(): Promise<void> {
        if (this.countTable) {
            return;
        }

        const pept2DataCommunicator = this.communicationSource.getPept2DataCommunicator();
        await pept2DataCommunicator.process(this.peptideCountTable, this.configuration);

        const pept2DataResponse = pept2DataCommunicator.getPeptideResponseMap(this.configuration);
        const buffers = pept2DataResponse.getBuffers();

        const [countsPerLca, lca2Peptides] = await QueueManager.getLongRunningQueue().pushTask<[
            CountTable<NcbiId>,
            Map<NcbiId, Peptide[]>
        ]>(() => {
            return new Promise<[CountTable<NcbiId>, Map<NcbiId, Peptide[]>]>((resolve) => {
                const worker = new Worker();
                worker.addEventListener("message", (event: MessageEvent) => {
                    const [countsPerLca, lca2Peptides] = event.data.result;
                    worker.terminate();
                    resolve([new CountTable<NcbiId>(countsPerLca), lca2Peptides]);
                });

                worker.postMessage({
                    args: [this.peptideCountTable, buffers[0], buffers[1]]
                });
            });
        })

        this.lca2Peptides = lca2Peptides;
        this.countTable = countsPerLca;
    }
}
