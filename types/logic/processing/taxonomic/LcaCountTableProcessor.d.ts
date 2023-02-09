import PeptideData from "@/logic/communication/peptide/PeptideData";
import Peptide from "@/logic/ontology/peptide/Peptide";
import NcbiId from "@/logic/ontology/taxonomic/NcbiId";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../CountTable";
import ProteomicsCountTableProcessor from "../ProteomicsCountTableProcessor";
export default class LcaCountTableProcessor implements ProteomicsCountTableProcessor<NcbiId> {
    private readonly peptideCountTable;
    private readonly pept2Data;
    private countTable?;
    private lca2Peptides?;
    constructor(peptideCountTable: CountTable<Peptide>, pept2Data: ShareableMap<Peptide, PeptideData>);
    cancel(): void;
    isCancelled(): boolean;
    getCountTable(): CountTable<NcbiId>;
    getAnnotationPeptideMapping(): Map<NcbiId, Peptide[]>;
    compute(): Promise<void>;
}
