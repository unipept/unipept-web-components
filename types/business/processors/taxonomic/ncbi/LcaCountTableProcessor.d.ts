import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import ProteomicsCountTableProcessor from "./../../ProteomicsCountTableProcessor";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
export default class LcaCountTableProcessor implements ProteomicsCountTableProcessor<NcbiId> {
    private readonly peptideCountTable;
    private readonly configuration;
    private readonly communicationSource;
    private countTable;
    private lca2Peptides;
    private static pool;
    constructor(peptideCountTable: CountTable<Peptide>, configuration: SearchConfiguration, communicationSource: CommunicationSource);
    cancel(): void;
    isCancelled(): boolean;
    getCountTable(): Promise<CountTable<NcbiId>>;
    getAnnotationPeptideMapping(): Promise<Map<NcbiId, Peptide[]>>;
    protected compute(): Promise<void>;
}
