import OntologyProcessor from "./../../OntologyProcessor";
import NcbiTaxon, { NcbiId } from "./NcbiTaxon";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";
import NcbiResponseCommunicator from "./../../../communication/taxonomic/ncbi/NcbiResponseCommunicator";

export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    public async getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>> {
        const ids = new Set<NcbiId>(table.getOntologyIds());
        await NcbiResponseCommunicator.process(ids);

        const definitions = new Map<NcbiId, NcbiTaxon>();

        for (const id of ids) {
            const apiResponse = NcbiResponseCommunicator.getResponse(id);

            if (apiResponse) {
                definitions.set(id, new NcbiTaxon(
                    apiResponse.id,
                    apiResponse.name,
                    apiResponse.rank,
                    apiResponse.lineage
                ))
            }
        }

        return new Ontology<NcbiId, NcbiTaxon>(definitions);
    }

    public async getDefinition(id: NcbiId): Promise<NcbiTaxon> {
        await NcbiResponseCommunicator.process(new Set<NcbiId>([id]));
        const response = NcbiResponseCommunicator.getResponse(id);
        if (response) {
            return new NcbiTaxon(id, response.name, response.rank, response.lineage);
        } else {
            return undefined;
        }
    }
}
