import Assay from "./Assay";
import MPAConfig from "../MPAConfig";
import PeptideContainer from "../PeptideContainer";
import MetaProteomicsDataRepository from "../../data-source/repository/MetaProteomicsDataRepository";
import ProgressListener from "../../patterns/progress/ProgressListener";
import Visitor from "../../patterns/visitor/Visitor";
import StorageDataReader from "../visitors/storage/StorageDataReader";

export default class MetaProteomicsAssay extends Assay implements ProgressListener {
    public peptideContainer: PeptideContainer = new PeptideContainer();

    async initDataRepository(mpaConfig: MPAConfig) {
        let dataReader = new StorageDataReader();
        await this.visit(dataReader);
        let dataRepo = new MetaProteomicsDataRepository(this, mpaConfig);
        await dataRepo.initProcessedPeptideContainer();
        this._dataRepository = dataRepo;
    }

    async visit(visitor: Visitor): Promise<void> {
        await visitor.visitMetaProteomicsAssay(this);
    }

    getPeptides(): string[] {
        return this.peptideContainer.getPeptides();
    }
    
    setPeptides(peptides: string[]) {
        this.peptideContainer.setPeptides(peptides)
    }

    getAmountOfPeptides(): number {
        return this.peptideContainer.getAmountOfPeptides();
    }

    setAmountOfPeptides(amount: number) {
        this.peptideContainer.setAmountOfPeptides(amount)
    }

    onProgressUpdate(progress: number): void {
        this.progress = progress;
    }
}
