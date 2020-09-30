import { CountTable, SearchConfiguration, NcbiId, ProteomicsCountTableProcessor, CommunicationSource, Peptide } from "@/business";
export default class LcaCountTableProcessor implements ProteomicsCountTableProcessor<NcbiId> {
    private readonly peptideCountTable;
    private readonly configuration;
    private readonly communicationSource;
    private countTable;
    private lca2Peptides;
    constructor(peptideCountTable: CountTable<Peptide>, configuration: SearchConfiguration, communicationSource: CommunicationSource);
    cancel(): void;
    isCancelled(): boolean;
    getCountTable(): Promise<CountTable<NcbiId>>;
    getAnnotationPeptideMapping(): Promise<Map<NcbiId, Peptide[]>>;
    protected compute(): Promise<void>;
}
