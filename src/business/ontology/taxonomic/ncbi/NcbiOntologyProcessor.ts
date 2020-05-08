import OntologyProcessor from "./../../OntologyProcessor";
import NcbiTaxon, { NcbiId } from "./NcbiTaxon";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";
import NcbiResponseCommunicator from "./../../../communication/taxonomic/ncbi/NcbiResponseCommunicator";
import CommunicationSource from "./../../../communication/source/CommunicationSource";

export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    constructor(private readonly comSource: CommunicationSource) {}

    public async getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>> {
        return await this.getOntologyByIds(table.getOntologyIds());
    }

    public async getOntologyByIds(ids: NcbiId[]): Promise<Ontology<NcbiId, NcbiTaxon>> {
        const communicator = this.comSource.getNcbiCommunicator();
        await communicator.process(ids);

        const definitions = new Map<NcbiId, NcbiTaxon>();

        for (const id of ids) {
            const apiResponse = communicator.getResponse(id);

            if (apiResponse) {
                definitions.set(id, new NcbiTaxon(
                    apiResponse.id,
                    apiResponse.name,
                    apiResponse.rank,
                    apiResponse.lineage
                ));

                for (let lineageId of apiResponse.lineage.filter(t => t !== null && t !== -1)) {
                    lineageId = Math.abs(lineageId);
                    const apiResponse = communicator.getResponse(lineageId);

                    if (apiResponse) {
                        definitions.set(lineageId, new NcbiTaxon(
                            apiResponse.id,
                            apiResponse.name,
                            apiResponse.rank,
                            apiResponse.lineage
                        ));
                    }
                }
            }
        }

        return new Ontology<NcbiId, NcbiTaxon>(definitions);
    }

    public async getDefinition(id: NcbiId): Promise<NcbiTaxon> {
        const communicator = this.comSource.getNcbiCommunicator();
        await communicator.process([id]);
        const response = communicator.getResponse(id);
        if (response) {
            return new NcbiTaxon(id, response.name, response.rank, response.lineage);
        } else {
            return undefined;
        }
    }
}
