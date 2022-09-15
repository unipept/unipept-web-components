import InterproCode from "../../../../logic/ontology/functional/interpro/InterproCode";
import FunctionalResponseCommunicator from "../FunctionalResponseCommunicator";
import InterproResponse from "./InterproResponse";
export default class InterproResponseCommunicator implements FunctionalResponseCommunicator<InterproCode, InterproResponse> {
    private static interproCodeToResponseMap;
    private static codesProcessed;
    private static inProgress;
    private static readonly apiBaseUrl;
    static readonly INTERPRO_BATCH_SIZE: number;
    static readonly INTERPRO_ENDPOINT: string;
    process(codes: InterproCode[]): Promise<void>;
    getResponse(code: InterproCode): InterproResponse | undefined;
    getResponseMap(): Map<InterproCode, InterproResponse>;
    private static doProcess;
}
