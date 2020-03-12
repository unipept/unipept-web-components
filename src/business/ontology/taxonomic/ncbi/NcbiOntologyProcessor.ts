import OntologyProcessor from "@/business/ontology/OntologyProcessor";
import NcbiTaxon, { NcbiId } from "@/business/ontology/taxonomic/ncbi/NcbiTaxon";
import { CountTable } from "@/business/counts/CountTable";
import { Ontology } from "@/business/ontology/Ontology";
import NcbiResponseCommunicator from "@/business/communication/taxonomic/ncbi/NcbiResponseCommunicator";

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
}
