import Assay from "./Assay";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import AssayVisitor from "./AssayVisitor";
import { Peptide } from "./../../ontology/raw/Peptide";
import AnalysisSource from "./../../communication/analysis/AnalysisSource";
import { v4 as uuidv4 } from "uuid";

export default class ProteomicsAssay extends Assay {
    protected amountOfPeptides: number = 0;

    private searchConfiguration: SearchConfiguration = new SearchConfiguration();
    private peptides: Peptide[] = [];
    private analysisSource: AnalysisSource;

    constructor(
        public id: string = uuidv4()
    ) {
        super(id);
    }

    public getSearchConfiguration(): SearchConfiguration {
        return this.searchConfiguration;
    }

    public setSearchConfiguration(value: SearchConfiguration) {
        this.searchConfiguration = value;
    }

    public getPeptides(): Peptide[] {
        return this.peptides;
    }

    public setPeptides(peptides: Peptide[]): void {
        this.amountOfPeptides = peptides.length;
        this.peptides = peptides;
    }

    public getAmountOfPeptides(): number {
        return this.amountOfPeptides;
    }

    public setAmountOfPeptides(amount: number): void {
        this.amountOfPeptides = amount;
    }

    public getAnalysisSource(): AnalysisSource {
        return this.analysisSource;
    }

    public setAnalysisSource(source: AnalysisSource): void {
        this.analysisSource = source;
    }

    public accept(visitor: AssayVisitor): Promise<void> {
        return visitor.visitProteomicsAssay(this);
    }
}
