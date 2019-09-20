import {OntologyType} from '../ontology/OntologyType'

type OntologyId = string;
type Count = number;

export class CountTable
{
    private _table: Map<OntologyId, Count>;
    private _ontology: OntologyType;

    constructor(ontology: OntologyType)
    {
        this._table = new Map<OntologyId, Count>();
        this._ontology = ontology;
    }
}