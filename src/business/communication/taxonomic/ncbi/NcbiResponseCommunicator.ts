import NcbiResponse from "@/business/communication/taxonomic/ncbi/NcbiResponse";
import { NcbiId } from "@/business/ontology/taxonomic/ncbi/NcbiTaxon";
import { postJSON } from "@/logic/utils";
import NetworkConfiguration from "@/business/communication/NetworkConfiguration";

export default class NcbiResponseCommunicator {
    private static idToResponseMap = new Map<NcbiId, NcbiResponse>();
    private static idsProcessed = new Set<NcbiId>();

    public static readonly NCBI_BATCH_SIZE: number = 100;
    public static readonly NCBI_ENDPOINT: string = "/private_api/taxa";

    public static async process(codes: Set<NcbiId>): Promise<void> {
        const toProcess = [...codes].filter(c => this.idsProcessed.has(c));

        for (let i = 0; i < toProcess.length; i += this.NCBI_BATCH_SIZE) {
            const data = JSON.stringify({
                taxids: toProcess.slice(i, i + this.NCBI_BATCH_SIZE)
            });

            const res = await postJSON(NetworkConfiguration.BASE_URL + this.NCBI_ENDPOINT, data);

            for (const term of res) {
                if (!this.idToResponseMap.has(term.code)) {
                    this.idToResponseMap.set(term.code, term);
                }
            }
        }

        for (const processed of toProcess) {
            this.idsProcessed.add(processed);
        }
    }

    public static getResponse(id: NcbiId): NcbiResponse {
        return this.idToResponseMap.get(id);
    }
}
