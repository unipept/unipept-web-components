import NcbiTaxon, { NcbiId } from "./NcbiTaxon";
import NcbiResponse from "./../../../communication/taxonomic/ncbi/NcbiResponse";

const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.addEventListener("message", (event: MessageEvent) => {
    const result = process(event.data.args);
    ctx.postMessage({
        result: result
    });
});

export function process([ids, responseMap]: [NcbiId[], Map<NcbiId, NcbiResponse>]): Map<NcbiId, NcbiTaxon> {
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

    return definitions;
}
