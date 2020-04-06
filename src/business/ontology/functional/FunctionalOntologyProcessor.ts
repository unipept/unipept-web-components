import { Ontology, OntologyIdType } from "./../Ontology";
import OntologyProcessor from "./../OntologyProcessor";
import { CountTable } from "./../../counts/CountTable";
import FunctionalDefinition from "./FunctionalDefinition";
import FunctionalResponseCommunicator from "./../../communication/functional/FunctionalResponseCommunicator";
import FunctionalResponse from "./../../communication/functional/FunctionalResponse";

export default abstract class FunctionalOntologyProcessor<
    OntologyId extends OntologyIdType,
    DefinitionType extends FunctionalDefinition,
    ResponseType extends FunctionalResponse<OntologyId>
> implements OntologyProcessor<OntologyId, DefinitionType> {
    public async getOntology(table: CountTable<OntologyId>): Promise<Ontology<OntologyId, DefinitionType>> {
        return await this.getOntologyByIds(table.getOntologyIds());
    }

    public async getOntologyByIds(ids: OntologyId[]): Promise<Ontology<OntologyId, DefinitionType>> {
        const communicator = this.getCommunicator();
        await communicator.process(ids);

        const definitions = new Map<OntologyId, DefinitionType>();

        for (const code of ids) {
            const apiResponse = communicator.getResponse(code);

            if (apiResponse) {
                definitions.set(code, this.responseToDefinition(apiResponse));
            }
        }

        return new Ontology<OntologyId, DefinitionType>(definitions);
    }

    public async getDefinition(id: OntologyId): Promise<DefinitionType> {
        const communicator = this.getCommunicator();
        await communicator.process([id]);

        const response = communicator.getResponse(id);
        if (response) {
            return this.responseToDefinition(response);
        } else {
            return undefined;
        }
    }

    protected abstract getCommunicator(): FunctionalResponseCommunicator<OntologyId, ResponseType>;

    protected abstract responseToDefinition(response: ResponseType): DefinitionType;
}
