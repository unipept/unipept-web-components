import {ProcessedPeptideContainer} from '../../data-management/ProcessedPeptideContainer';

export interface PeptideProcessor<CountTable>
{
    process(processedPeptides: ProcessedPeptideContainer) : CountTable
}
