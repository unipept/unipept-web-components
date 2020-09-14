import { OntologyIdType } from "./../../ontology/Ontology";
import FunctionalResponse from "./FunctionalResponse";
export default interface FunctionalResponseCommunicator<OntologyId extends OntologyIdType, ResponseType extends FunctionalResponse<OntologyId>> {
    process(codes: OntologyId[]): Promise<void>;
    getResponse(code: OntologyId): ResponseType;
    getResponseMap(): Map<OntologyId, ResponseType>;
}
