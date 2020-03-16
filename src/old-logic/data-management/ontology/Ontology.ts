import Definition from "@/business/ontology/Definition";

export abstract class Ontology<OntologyId, DefinitionType extends Definition> {
    constructor(
        private readonly definitions = new Map<OntologyId, DefinitionType>()
    ) {}

    getDefinition(id: OntologyId) : Readonly<DefinitionType> | undefined {
        return this.definitions.get(id);
    }
}
