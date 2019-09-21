import {OntologyType} from '../ontology/OntologyType'

export type OntologyId = string;
export type Peptide = string;
export type Count = number;

export type Counts = Map<OntologyId, Count>;
export type Ontology2PeptideMap = Map<OntologyId, Set<Peptide>>;
export type Peptide2OntologyMap = Map<Peptide, Set<OntologyId>>;

export class CountTable
{
    constructor(
        private _ontology: OntologyType, 
        private _counts: Counts, 
        private _ontology2peptide: Ontology2PeptideMap = undefined, 
        private _peptide2ontology: Peptide2OntologyMap = undefined)
    {}

    GetOntologyType(){
        return this._ontology;
    }

    GetCounts() : ReadonlyMap<OntologyId, Count>{
        return this._counts;
    }

    GetOntology2PeptideMap() : ReadonlyMap<OntologyId, Set<Peptide>>{
        return this._ontology2peptide;
    }

    GetPeptide2OntologyMap() : ReadonlyMap<Peptide, Set<OntologyId>>{
        return this._peptide2ontology;
    }
}