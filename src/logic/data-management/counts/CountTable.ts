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
        readonly ontology: OntologyType, 
        readonly counts: Counts, 
        readonly ontology2peptide: Ontology2PeptideMap = undefined, 
        readonly peptide2ontology: Peptide2OntologyMap = undefined)
    {}
}