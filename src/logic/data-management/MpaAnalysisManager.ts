import Assay from "./assay/Assay";
import MPAConfig from "./MPAConfig";

export default class MpaAnalysisManager {
    async processDataset(assay: Assay, searchSettings: MPAConfig, baseUrl: string): Promise<void> {
        await assay.initDataRepository(searchSettings, baseUrl);
    }
}
