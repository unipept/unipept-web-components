import Assay from "./Assay";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import AssayVisitor from "./AssayVisitor";
import { Peptide } from "./../../ontology/raw/Peptide";
import AnalysisSource from "@/business/communication/analysis/AnalysisSource";
export default class ProteomicsAssay extends Assay {
    id: string;
    protected amountOfPeptides: number;
    private searchConfiguration;
    private peptides;
    private analysisSource;
    constructor(id: string);
    getSearchConfiguration(): SearchConfiguration;
    setSearchConfiguration(value: SearchConfiguration): void;
    getPeptides(): Peptide[];
    setPeptides(peptides: Peptide[]): void;
    getAmountOfPeptides(): number;
    setAmountOfPeptides(amount: number): void;
    getAnalysisSource(): AnalysisSource;
    accept(visitor: AssayVisitor): Promise<void>;
}
