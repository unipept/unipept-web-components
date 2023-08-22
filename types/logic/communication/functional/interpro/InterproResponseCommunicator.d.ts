import InterproCode from "../../../../logic/ontology/functional/interpro/InterproCode";
import FunctionalResponseCommunicator from "../FunctionalResponseCommunicator";
import InterproResponse from "./InterproResponse";
export default class InterproResponseCommunicator implements FunctionalResponseCommunicator<InterproCode, InterproResponse> {
    private static interproCodeToResponseMap;
    private static codesProcessed;
    private static inProgress;
    static readonly INTERPRO_ENDPOINT: string;
    static apiBaseUrl: string;
    static batchSize: number;
    static setup(apiBaseUrl: string, batchSize: number): void;
    process(codes: InterproCode[]): Promise<void>;
    getResponse(code: InterproCode): InterproResponse | undefined;
    getResponseMap(): Map<InterproCode, InterproResponse>;
    private static doProcess;
}
