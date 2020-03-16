import { PeptideCountTable } from "./counts/PeptideCountTable";
import { Pept2DataResponse } from "../api/pept2data/Response";

export type ProcessedPeptideContainer = 
{
    countTable: PeptideCountTable,
    response: Pept2DataResponse,
    missed: string[],
    numMatched: number,
    numSearched: number
}
