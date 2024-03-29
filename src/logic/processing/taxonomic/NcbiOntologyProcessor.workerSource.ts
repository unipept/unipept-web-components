import NcbiResponse from "../../../logic/communication/taxonomic/NcbiResponse";
import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";
import NcbiTaxon from "../../../logic/ontology/taxonomic/NcbiTaxon";

export default async function compute(
    [ids, responseMap, withLineage]: [NcbiId[], Map<NcbiId, NcbiResponse>, boolean]
): Promise<Map<NcbiId, NcbiTaxon>> {
    const definitions = new Map<NcbiId, NcbiTaxon>();

    for (const id of ids) {
        const apiResponse = responseMap.get(id);

        if (apiResponse) {
            definitions.set(id, new NcbiTaxon(
                apiResponse.id,
                apiResponse.name,
                apiResponse.rank,
                apiResponse.lineage
            ));

            if (withLineage) {
                for (let lineageId of apiResponse.lineage.filter(t => t !== null && t !== -1)) {
                    lineageId = Math.abs(lineageId);
                    const apiResponse = responseMap.get(lineageId);

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
    }

    return definitions;
};
