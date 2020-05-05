import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import Pept2DataCommunicator from "./../../../communication/peptides/Pept2DataCommunicator";
import ProteomicsCountTableProcessor from "./../../ProteomicsCountTableProcessor";
import { spawn, Worker } from "threads";

export default class LcaCountTableProcessor implements ProteomicsCountTableProcessor<NcbiId> {
    private countTable: CountTable<NcbiId>;
    private lca2Peptides: Map<NcbiId, Peptide[]>;

    constructor(
        private readonly peptideCountTable: CountTable<Peptide>,
        private readonly configuration: SearchConfiguration
    ) {}

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

        await Pept2DataCommunicator.process(this.peptideCountTable, this.configuration);

        const worker = await spawn(new Worker("./LcaCountTableProcessor.worker.ts"));
        const [countsPerLca, lca2Peptides] = await worker(this.peptideCountTable, Pept2DataCommunicator.getPeptideResponseMap(this.configuration))

        this.lca2Peptides = lca2Peptides;
        this.countTable = new CountTable<NcbiId>(countsPerLca);
    }
}
