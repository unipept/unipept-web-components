import NcbiResponse from "./NcbiResponse";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
export default class NcbiResponseCommunicator {
    private static idToResponseMap;
    private static idsProcessed;
    static readonly NCBI_BATCH_SIZE: number;
    static readonly NCBI_ENDPOINT: string;
    private static inProgress;
    process(codes: NcbiId[]): Promise<void>;
    getResponse(id: NcbiId): NcbiResponse;
    getResponseMap(): Map<NcbiId, NcbiResponse>;
    private doProcess;
}
