import Assay from "./Assay";
import MPAConfig from "../MPAConfig";
import PeptideContainer from "../PeptideContainer";
import MetaProteomicsDataRepository from "../../data-source/repository/MetaProteomicsDataRepository";
import ProgressListener from "../../patterns/progress/ProgressListener";
import Visitor from "../../patterns/visitor/Visitor";
import StorageDataReader from "../visitors/storage/StorageDataReader";
import { AssayState } from './AssayState';

export default class MetaProteomicsAssay extends Assay implements ProgressListener {
    public peptideContainer: PeptideContainer = new PeptideContainer();

    async initialize(mpaConfig: MPAConfig) {
        try
        {
            this._state = AssayState.Loading;

            let dataReader = new StorageDataReader();
            this._dataRepository = new MetaProteomicsDataRepository(this, mpaConfig);

            await this.visit(dataReader);
            await (this._dataRepository as MetaProteomicsDataRepository).initProcessedPeptideContainer()

            this._state = AssayState.Initialized;
        }
        catch(error)
        {
            this._state = AssayState.Rejected;
            this._rejectCause = error;

            // re-throw error so it can be catched by the caller
            throw error;
        }
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
        this._progress = progress;
    }
}
