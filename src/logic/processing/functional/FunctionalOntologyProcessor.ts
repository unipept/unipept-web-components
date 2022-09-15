import FunctionalResponse from "../../../logic/communication/functional/FunctionalResponse";
import FunctionalResponseCommunicator from "../../../logic/communication/functional/FunctionalResponseCommunicator";
import FunctionalDefinition from "../../../logic/ontology/functional/FunctionalDefinition";
import Ontology from "../../../logic/ontology/Ontology";
import OntologyCode from "../../../logic/ontology/OntologyCode";
import CountTable from "../CountTable";
import OntologyProcessor from "../OntologyProcessor";

export default abstract class FunctionalOntologyProcessor<
    OntologyId extends OntologyCode,
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

    public async getDefinition(id: OntologyId): Promise<DefinitionType | undefined> {
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
