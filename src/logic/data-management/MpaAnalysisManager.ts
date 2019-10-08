import PeptideContainer from './PeptideContainer';
import Sample from './Sample';
import MPAConfig from './MPAConfig';

export default class MpaAnalysisManager {
    public async processDataset(peptideContainer: PeptideContainer, searchSettings: MPAConfig): Promise<void> 
    {
        peptideContainer.setDataset(null);
        const dataset: Sample = new Sample(peptideContainer, peptideContainer.getId(), searchSettings, peptideContainer);
        peptideContainer.setDataset(dataset);

        // Force early analysis here
        await dataset.dataRepository.getProcessedPeptideContainer();
    }
}
