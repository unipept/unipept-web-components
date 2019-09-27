import {CountTable, Count} from './CountTable';
import {NCBITaxonomy} from '../ontology/taxa/NCBITaxonomy';

export class TaxaCountTable extends CountTable<NCBITaxonomy, number>
{
    constructor(
        counts: Map<number, Count>, 
        ontology2peptide: Map<number, Set<string>> = undefined)
    {
        super(counts, ontology2peptide)
    }

    GetOntology(): NCBITaxonomy {
        throw new Error("Method not implemented.");
    }
}
