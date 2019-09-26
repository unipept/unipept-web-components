import {PeptideProcessor} from "../PeptideProcessor";
import {ProcessedPeptideContainer} from '../../../data-management/ProcessedPeptideContainer';
import {CountTable} from '../../../data-management/counts/CountTable';

export class TaxaPeptideProcessor implements PeptideProcessor
{
    process(processedPeptides: ProcessedPeptideContainer): CountTable 
    {
        throw new Error("Method not implemented.");
    }
}