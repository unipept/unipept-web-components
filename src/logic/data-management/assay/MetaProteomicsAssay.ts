import Assay from "./Assay";
import MPAConfig from "../MPAConfig";
import PeptideContainer from "../PeptideContainer";
import MetaProteomicsDataRepository from "../../data-source/repository/MetaProteomicsDataRepository";
import ProgressListener from "../../patterns/progress/ProgressListener";
import AssayVisitor from "./AssayVisitor";

export default class MetaProteomicsAssay extends Assay implements ProgressListener {
    public peptideContainer: PeptideContainer = new PeptideContainer();

    async initDataRepository(mpaConfig: MPAConfig, baseUrl: string) {
        let dataRepo = new MetaProteomicsDataRepository(this, mpaConfig, baseUrl);
        await dataRepo.initProcessedPeptideContainer();
        this._dataRepository = dataRepo;
    }

    async accept(visitor: AssayVisitor): Promise<void> {
        await visitor.visitMetaProteomicsAssay(this);
    }

    getPeptides(): string[] {
        return this.peptideContainer.getPeptides();
    }

    setPeptides(peptides: string[]) {
        const oldPeptides: string[] = this.peptideContainer.getPeptides();
        this.peptideContainer.setPeptides(peptides);
        this.changeListener.onChange(this, "peptides", oldPeptides, peptides);
    }

    getAmountOfPeptides(): number {
        return this.peptideContainer.getAmountOfPeptides();
    }

    onProgressUpdate(progress: number): void {
        this.progress = progress;
    }
}
