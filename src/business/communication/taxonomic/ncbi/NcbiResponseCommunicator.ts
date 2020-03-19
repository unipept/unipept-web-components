import NcbiResponse from "./NcbiResponse";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import NetworkConfiguration from "./../../NetworkConfiguration";
import NetworkUtils from "./../../NetworkUtils";

export default class NcbiResponseCommunicator {
    private static idToResponseMap = new Map<NcbiId, NcbiResponse>();
    private static idsProcessed = new Set<NcbiId>();

    public static readonly NCBI_BATCH_SIZE: number = 100;
    public static readonly NCBI_ENDPOINT: string = "/private_api/taxa";

    public static async process(codes: NcbiId[]): Promise<void> {
        const toProcess = codes.filter(c => !this.idsProcessed.has(c));

        const lineagesToProcess: Set<NcbiId> = new Set();

        for (let i = 0; i < toProcess.length; i += this.NCBI_BATCH_SIZE) {
            const data = JSON.stringify({
                taxids: toProcess.slice(i, i + this.NCBI_BATCH_SIZE)
            });

            const res = await NetworkUtils.postJSON(NetworkConfiguration.BASE_URL + this.NCBI_ENDPOINT, data);

            for (const term of res) {
                if (!this.idToResponseMap.has(term.id)) {
                    this.idToResponseMap.set(term.id, term);
                    term.lineage.map(l => lineagesToProcess.add(l));
                }
            }
        }

        const lineages = [...lineagesToProcess].filter(c => !this.idsProcessed.has(c));

        for (let i = 0; i < lineages.length; i += this.NCBI_BATCH_SIZE) {
            const data = JSON.stringify({
                taxids: lineages.slice(i, i + this.NCBI_BATCH_SIZE)
            });

            const res = await NetworkUtils.postJSON(NetworkConfiguration.BASE_URL + this.NCBI_ENDPOINT, data);

            for (const term of res) {
                if (!this.idToResponseMap.has(term.id)) {
                    this.idToResponseMap.set(term.id, term);
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
