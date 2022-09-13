import { NcbiId } from "@/logic/ontology";
import NetworkConfiguration from "../NetworkConfiguration";
import NetworkUtils from "../NetworkUtils";
import NcbiResponse from "./NcbiResponse";

export default class NcbiResponseCommunicator {
    private static idToResponseMap = new Map<NcbiId, NcbiResponse>();
    private static idsProcessed = new Set<NcbiId>();

    private static readonly apiBaseUrl = "http://api.unipept.ugent.be/" // TODO: THIS CANNOT BE HARDCODED HERE!!!
    public static readonly NCBI_BATCH_SIZE: number = 100;
    public static readonly NCBI_ENDPOINT: string = "/private_api/taxa";

    private static inProgress: Promise<void> | undefined;

    public async process(codes: NcbiId[]): Promise<void> {
        while (NcbiResponseCommunicator.inProgress) {
            await NcbiResponseCommunicator.inProgress;
        }

        NcbiResponseCommunicator.inProgress = this.doProcess(codes);

        try {
            await NcbiResponseCommunicator.inProgress;
        } finally {
            NcbiResponseCommunicator.inProgress = undefined;
        }
    }

    public getResponse(id: NcbiId): NcbiResponse | undefined {
        return NcbiResponseCommunicator.idToResponseMap.get(id);
    }

    public getResponseMap(): Map<NcbiId, NcbiResponse> {
        return NcbiResponseCommunicator.idToResponseMap;
    }

    private async doProcess(codes: NcbiId[]): Promise<void> {
        const toProcess = codes.filter(c => c && !NcbiResponseCommunicator.idsProcessed.has(c));

        const lineagesToProcess: Set<NcbiId> = new Set();

        for (let i = 0; i < toProcess.length; i += NcbiResponseCommunicator.NCBI_BATCH_SIZE) {
            const data = JSON.stringify({
                taxids: toProcess.slice(i, i + NcbiResponseCommunicator.NCBI_BATCH_SIZE)
            });

            const res = await NetworkUtils.postJSON(
                NcbiResponseCommunicator.apiBaseUrl + NcbiResponseCommunicator.NCBI_ENDPOINT,
                data
            );

            for (const term of res) {
                if (!NcbiResponseCommunicator.idToResponseMap.has(term.id)) {
                    NcbiResponseCommunicator.idToResponseMap.set(term.id, term);
                    // Some id's are negative due to erroneous classification in the NCBI taxonomy. These taxon id's do
                    // need to be retrieved however!
                    term.lineage.map((l: number) => {
                        if(l!= -1) {
                            lineagesToProcess.add(Math.abs(l))
                        }
                    });
                }
            }
        }

        const lineages = [...lineagesToProcess].filter(
            c => c && c !== -1 && !NcbiResponseCommunicator.idsProcessed.has(c)
        );

        for (let i = 0; i < lineages.length; i += NcbiResponseCommunicator.NCBI_BATCH_SIZE) {
            const data = JSON.stringify({
                taxids: lineages.slice(i, i + NcbiResponseCommunicator.NCBI_BATCH_SIZE)
            });

            const res = await NetworkUtils.postJSON(
                NcbiResponseCommunicator.apiBaseUrl + NcbiResponseCommunicator.NCBI_ENDPOINT,
                data
            );

            for (const term of res) {
                if (!NcbiResponseCommunicator.idToResponseMap.has(term.id)) {
                    NcbiResponseCommunicator.idToResponseMap.set(term.id, term);
                }
            }
        }

        for (const processed of toProcess) {
            NcbiResponseCommunicator.idsProcessed.add(processed);
        }
    }
}
