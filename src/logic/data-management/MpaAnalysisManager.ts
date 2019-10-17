import Assay from "./assay/Assay";
import MPAConfig from './MPAConfig';

export default class MpaAnalysisManager 
{
    async processDataset(dataset: Assay, searchSettings: MPAConfig): Promise<void> 
    {
        await dataset.initDataRepository(searchSettings);
    }
}
