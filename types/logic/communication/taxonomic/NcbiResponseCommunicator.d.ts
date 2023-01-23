import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";
import NcbiResponse from "./NcbiResponse";
export default class NcbiResponseCommunicator {
    private static idToResponseMap;
    private static idsProcessed;
    static readonly NCBI_ENDPOINT: string;
    private static apiBaseUrl;
    private static batchSize;
    private static inProgress;
    static setup(apiBaseUrl: string, batchSize: number): void;
    process(codes: NcbiId[]): Promise<void>;
    getResponse(id: NcbiId): NcbiResponse | undefined;
    getResponseMap(): Map<NcbiId, NcbiResponse>;
    private doProcess;
}
