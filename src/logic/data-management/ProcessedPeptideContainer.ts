import { CountTable } from './counts/CountTable';
import { pept2dataResponse } from '../api/pept2data/Response';

export class ProcessedPeptideContainer
{
    constructor(
        readonly countTable: CountTable, 
        readonly response: pept2dataResponse,
        readonly missed: string[],
        readonly numMatched: number,
        readonly numSearched: number)
    {}
}
