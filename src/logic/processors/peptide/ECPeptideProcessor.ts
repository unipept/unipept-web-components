import {ProcessedPeptideContainer} from '../../data-management/ProcessedPeptideContainer';
import { ECCountTable } from '../../data-management/counts/ECCountTable';
import { FAPeptideProcessor } from './FAPeptideProcessor';

export namespace ECPeptideProcessor
{
    export function process(processedPeptides: ProcessedPeptideContainer): ECCountTable 
    {
        return FAPeptideProcessor.process(processedPeptides, "EC:", (a, b, c) => new ECCountTable(a, b, c));
    }
}
