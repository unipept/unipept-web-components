import {CountTable, Count} from './CountTable';
import {ECOntology} from '../ontology/ec/ECOntology';

export class ECCountTable extends CountTable<ECOntology, string>
{
    constructor(
        counts: Map<string, Count>, 
        peptide2ontology: Map<string, Set<string>> = undefined)
    {
        super(counts, undefined, peptide2ontology)
    }

    GetOntology(): ECOntology {
        throw new Error("Method not implemented.");
    }
}