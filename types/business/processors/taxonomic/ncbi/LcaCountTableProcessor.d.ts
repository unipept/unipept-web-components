import { CountTable, SearchConfiguration, NcbiId, ProteomicsCountTableProcessor, Peptide, PeptideData } from "@/business";
import { ShareableMap } from "shared-memory-datastructures";
export default class LcaCountTableProcessor implements ProteomicsCountTableProcessor<NcbiId> {
    private readonly peptideCountTable;
    private readonly configuration;
    private readonly pept2Data;
    private countTable;
    private lca2Peptides;
    constructor(peptideCountTable: CountTable<Peptide>, configuration: SearchConfiguration, pept2Data: ShareableMap<Peptide, PeptideData>);
    cancel(): void;
    isCancelled(): boolean;
    getCountTable(): CountTable<NcbiId>;
    getAnnotationPeptideMapping(): Map<NcbiId, Peptide[]>;
    compute(): Promise<void>;
}
