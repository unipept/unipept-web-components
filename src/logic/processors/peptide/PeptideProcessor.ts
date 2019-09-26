import {CountTable} from "../../data-management/counts/CountTable";
import {ProcessedPeptideContainer} from '../../data-management/ProcessedPeptideContainer';

export interface PeptideProcessor
{
    process(processedPeptides: ProcessedPeptideContainer) : CountTable
}
