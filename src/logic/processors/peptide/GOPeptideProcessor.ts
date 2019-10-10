import {ProcessedPeptideContainer} from '../../data-management/ProcessedPeptideContainer';
import { GOCountTable } from '../../data-management/counts/GOCountTable';
import { FAPeptideProcessor } from './FAPeptideProcessor';

export namespace GOPeptideProcessor
{
    export function process(processedPeptides: ProcessedPeptideContainer): GOCountTable 
    {
        return FAPeptideProcessor.process(processedPeptides, "GO:", (a, b, c) => new GOCountTable(a, b, c));
    }
}
