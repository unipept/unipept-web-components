export abstract class Ontology<OntologyId, Definition> {
    constructor(
        protected _definitions = new Map<OntologyId, Definition>()
    ){}
    
    /*
        Fetches definitions for given ids, from Unipept API at baseURL.
        Returns a set of ids that have been fetched, but not found.
    */
    abstract async fetchDefinitions(ids: OntologyId[], baseUrl: string) : Promise<Set<OntologyId>>;

    getDefinition(id: OntologyId) : Readonly<Definition> {
        return this._definitions.get(id);
    }
}
