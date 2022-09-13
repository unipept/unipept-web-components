import { FunctionalResponse, FunctionalResponseCommunicator } from "@/logic/communication";
import { FunctionalDefinition, Ontology } from "@/logic/ontology";
import OntologyCode from "@/logic/ontology/OntologyCode";
import CountTable from "../CountTable";
import OntologyProcessor from "../OntologyProcessor";
export default abstract class FunctionalOntologyProcessor<OntologyId extends OntologyCode, DefinitionType extends FunctionalDefinition, ResponseType extends FunctionalResponse<OntologyId>> implements OntologyProcessor<OntologyId, DefinitionType> {
    getOntology(table: CountTable<OntologyId>): Promise<Ontology<OntologyId, DefinitionType>>;
    getOntologyByIds(ids: OntologyId[]): Promise<Ontology<OntologyId, DefinitionType>>;
    getDefinition(id: OntologyId): Promise<DefinitionType | undefined>;
    protected abstract getCommunicator(): FunctionalResponseCommunicator<OntologyId, ResponseType>;
    protected abstract responseToDefinition(response: ResponseType): DefinitionType;
}
