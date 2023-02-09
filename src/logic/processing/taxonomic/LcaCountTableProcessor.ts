import PeptideData from "@/logic/communication/peptide/PeptideData";
import Peptide from "@/logic/ontology/peptide/Peptide";
import NcbiId from "@/logic/ontology/taxonomic/NcbiId";
import QueueManager from "@/logic/util/queue/QueueManager";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../CountTable";
import ProteomicsCountTableProcessor from "../ProteomicsCountTableProcessor";

export default class LcaCountTableProcessor implements ProteomicsCountTableProcessor<NcbiId> {
    private countTable?: CountTable<NcbiId>;
    private lca2Peptides?: Map<NcbiId, Peptide[]>;

    constructor(
        private readonly peptideCountTable: CountTable<Peptide>,
        private readonly pept2Data: ShareableMap<Peptide, PeptideData>
    ) {}

    public cancel() {
        // TODO implement...
    }

    public isCancelled(): boolean {
        return false;
    }

    public getCountTable(): CountTable<NcbiId> {
        return this.countTable!;
    }

    public getAnnotationPeptideMapping(): Map<NcbiId, Peptide[]> {
        return this.lca2Peptides!;
    }

    public async compute(): Promise<void> {
        if (this.countTable) {
            return;
        }

        const buffers = this.pept2Data.getBuffers();

        const [countsPerLca, lca2Peptides] = await QueueManager.getLongRunningQueue().pushTask<
            [Map<NcbiId, number>, Map<NcbiId, Peptide[]>],
            [CountTable<Peptide>, ArrayBuffer, ArrayBuffer]
        >("computeLcaCountTable", [this.peptideCountTable, buffers[0], buffers[1]]);

        this.lca2Peptides = lca2Peptides;
        this.countTable = new CountTable<NcbiId>(countsPerLca);
    }
}
