import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import ProteomicsCountTableProcessor from "./../../ProteomicsCountTableProcessor";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
import Worker from "worker-loader?inline=fallback!./LcaCountTableProcessor.worker";

export default class LcaCountTableProcessor implements ProteomicsCountTableProcessor<NcbiId> {
    private countTable: CountTable<NcbiId>;
    private lca2Peptides: Map<NcbiId, Peptide[]>;
    // private static pool = Pool(
    //     () => spawn(new Worker("./LcaCountTableProcessor.worker.ts")),
    //     2
    // );
    private static worker = new Worker();

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

        return new Promise<void>((resolve, reject) => {
            LcaCountTableProcessor.worker.addEventListener("message", (event: MessageEvent) => {
                const [countsPerLca, lca2Peptides] = event.data.result;
                this.lca2Peptides = lca2Peptides;
                this.countTable = new CountTable<NcbiId>(countsPerLca);

                resolve();
            });

            const pept2DataResponse = pept2DataCommunicator.getPeptideResponseMap(this.configuration);
            const buffers = pept2DataResponse.getBuffers();

            LcaCountTableProcessor.worker.postMessage({
                args: [this.peptideCountTable, buffers[0], buffers[1]]
            });

            // LcaCountTableProcessor.pool.queue(async(worker) => {
            //     const pept2DataResponse = pept2DataCommunicator.getPeptideResponseMap(this.configuration);
            //     const buffers = pept2DataResponse.getBuffers();
            //     const [countsPerLca, lca2Peptides] = await worker(
            //         this.peptideCountTable,
            //         buffers[0],
            //         buffers[1]
            //     );
            //
            //     this.lca2Peptides = lca2Peptides;
            //     this.countTable = new CountTable<NcbiId>(countsPerLca);
            //
            //     resolve();
            // });
        });
    }
}
