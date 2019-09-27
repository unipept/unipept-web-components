import {CountTable, Count} from './CountTable';
import {GeneOntology} from '../ontology/go/GeneOntology';

export class GOCountTable extends CountTable<GeneOntology, string>
{
    constructor(
        counts: Map<string, Count>, 
        peptide2ontology: Map<string, Set<string>> = undefined)
    {
        super(counts, undefined, peptide2ontology)
    }

    GetOntology(): GeneOntology {
        throw new Error("Method not implemented.");
    }
}