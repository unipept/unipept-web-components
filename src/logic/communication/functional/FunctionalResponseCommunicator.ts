import OntologyCode from "../../../logic/ontology/OntologyCode";
import FunctionalResponse from "./FunctionalResponse";

export default interface FunctionalResponseCommunicator<OntologyId extends OntologyCode, ResponseType extends FunctionalResponse<OntologyId>> {
    process(codes: OntologyId[]): Promise<void>;
    getResponse(code: OntologyId): ResponseType | undefined;
}
