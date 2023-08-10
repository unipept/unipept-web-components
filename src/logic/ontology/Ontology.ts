import Definition from "./Definition";

export default class Ontology<OntologyId, DefinitionType extends Definition> {
    constructor(
        private readonly definitions = new Map<OntologyId, DefinitionType>()
    ) {}

    getDefinition(id: OntologyId) : Readonly<DefinitionType> | undefined {
        return this.definitions.get(id);
    }

    getOntologyIds(): OntologyId[] {
        return [...this.definitions.keys()];
    }

    toMap(): Map<OntologyId, DefinitionType> {
        return this.definitions;
    }
}
