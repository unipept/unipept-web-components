import Assay from "./assay/Assay";
import MPAConfig from "./MPAConfig";

export default class MpaAnalysisManager {
    async processDataset(dataset: Assay, searchSettings: MPAConfig, baseUrl: string): Promise<void> {
        console.log("In MPA Analysis MAnager");
        await dataset.initDataRepository(searchSettings, baseUrl);
    }
}
