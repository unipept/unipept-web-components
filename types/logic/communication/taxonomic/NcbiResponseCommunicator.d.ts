import { NcbiId } from "@/logic/ontology";
import NcbiResponse from "./NcbiResponse";
export default class NcbiResponseCommunicator {
    private static idToResponseMap;
    private static idsProcessed;
    private static readonly apiBaseUrl;
    static readonly NCBI_BATCH_SIZE: number;
    static readonly NCBI_ENDPOINT: string;
    private static inProgress;
    process(codes: NcbiId[]): Promise<void>;
    getResponse(id: NcbiId): NcbiResponse | undefined;
    getResponseMap(): Map<NcbiId, NcbiResponse>;
    private doProcess;
}
