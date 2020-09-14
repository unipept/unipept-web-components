import { Ontology, OntologyIdType } from "./../Ontology";
import OntologyProcessor from "./../OntologyProcessor";
import { CountTable } from "./../../counts/CountTable";
import FunctionalDefinition from "./FunctionalDefinition";
import FunctionalResponseCommunicator from "./../../communication/functional/FunctionalResponseCommunicator";
import FunctionalResponse from "./../../communication/functional/FunctionalResponse";
export default abstract class FunctionalOntologyProcessor<OntologyId extends OntologyIdType, DefinitionType extends FunctionalDefinition, ResponseType extends FunctionalResponse<OntologyId>> implements OntologyProcessor<OntologyId, DefinitionType> {
    getOntology(table: CountTable<OntologyId>): Promise<Ontology<OntologyId, DefinitionType>>;
    getOntologyByIds(ids: OntologyId[]): Promise<Ontology<OntologyId, DefinitionType>>;
    getDefinition(id: OntologyId): Promise<DefinitionType>;
    protected abstract getCommunicator(): FunctionalResponseCommunicator<OntologyId, ResponseType>;
    protected abstract responseToDefinition(response: ResponseType): DefinitionType;
}
