export abstract class Ontology<OntologyId, Definition>
{
    private _definitions: Map<OntologyId, Definition>;

    constructor()
    {
        this._definitions = new Map<OntologyId, Definition>();
        this.fetchDefinitions();
    }

    abstract async fetchDefinitions() : Promise<void>;

    getDefinition(id: OntologyId) : Readonly<Definition>
    {
        return this._definitions.get(id);
    }
}
