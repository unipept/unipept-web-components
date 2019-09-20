import {OntologyType} from './OntologyType'

export abstract class Ontology
{
    private type: OntologyType;

    constructor(type: OntologyType)
    {
        this.type = type;
    }

    abstract init() : void;

    GetType(){return this.type;}
}
