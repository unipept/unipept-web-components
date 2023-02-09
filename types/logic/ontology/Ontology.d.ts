import Definition from "./Definition";
export default class Ontology<OntologyId, DefinitionType extends Definition> {
    private readonly definitions;
    constructor(definitions?: Map<OntologyId, DefinitionType>);
    getDefinition(id: OntologyId): Readonly<DefinitionType> | undefined;
    getOntologyIds(): OntologyId[];
    toMap(): Map<OntologyId, DefinitionType>;
}
